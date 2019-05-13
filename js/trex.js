(function () {
  // import Deserto from './Deserto';
  const LIMITE_TELA = '510px';
  const PROB_NUVEM = 5;
  const NIVEL_1 = 500;
  const NIVEL_2 = 450;
  const NIVEL_3 = 400;
  const NIVEL_4 = 300;
  const posicoesPtero = ['100px', '80px', '40px'];

  const pequenosCactus = {
    1: ['-229px', '-246px', '-263px', '-280px', '-297px', '-314px'],
    2: ['-229px', '-246px', '-263px', '-280px', '-297px'],
    3: ['-229px', '-280px', '-246px', '-263px'],
    4: ['-229px', '-246px', '-263px'],
    'width': {
      1: '15px',
      2: '32px',
      3: '49px',
      4: '66px',
    }
  };

  const grandesCactus = {
    1: ['-333px', '-358px', '-383px', '-408px', '-459px'],
    2: ['-333px', '-358px', '-383px', '-432px'],
    3: ['-333px', '-358px', '-385px', '-407px'],
    4: ['-333px'],
    'width': {
      1: '23px',
      2: '49px',
      3: '73px',
      4: '97px',
    },
  };

  const digitosPx = {
    0: '-484px',
    1: '-494px',
    2: '-504px',
    3: '-514px',
    4: '-524px',
    5: '-534px',
    6: '-544px',
    7: '-554px',
    8: '-564px',
    9: '-574px',
    'H': '-584px',
    'I': '-594px',
  };

  var gameLoop;
  var scoreLoop;
  var deserto;
  var dino;
  var nuvens = [];
  var pontuacao = [0, 0, 0, 0, 0];
  var obstaculos = [];

  let paused = false;
  let over = false;
  let tipo = '';
  let exibirObstaculo = false;
  let contador = 0;
  let framesPassados = 0;
  let nivel = 0;
  let FPS = 300;
  
  class Deserto {
    constructor(document) {
      this.element = document.createElement('div');
      this.element.className = 'deserto';
      document.body.appendChild(this.element);
      this.chao = document.createElement('div');
      this.chao.className = 'chao';
      this.chao.style.backgroundPositionX = '0px';
      this.element.appendChild(this.chao);
    }

    mover() {
      this.chao.style.backgroundPositionX = (parseInt(this.chao.style.backgroundPositionX) - 1) + 'px';
    }
  }
  class Dino {
    constructor(deserto, document) {
      this.sprites = {
        'correr1': '-767px',
        'correr2': '-811px',
        'pulando': '-678px',
        'agachar1': '-943px',
        'agachar2': '-1002px',
        'parado': '-42px'
      };
      this.status = -1; // 0:correndo; 1:subindo; 2: descendo; 3: agachado; -1: esperando
      this.alturaMaxima = '80px';
      this.element = document.createElement('div');
      this.element.className = 'dino';
      this.element.style.backgroundPositionX = this.sprites.parado;
      this.element.style.bottom = '4px';
      this.element.style.right = '452px';
      deserto.element.appendChild(this.element);
    }
    correr() {
      if (this.status == 0) {
        this.element.style.width = '40px';
        this.element.style.right = '452px';
        this.element.style.height = '43px';
        this.element.style.backgroundPositionY = '-4px';
        this.element.style.backgroundPositionX = (this.element.style.backgroundPositionX == this.sprites.correr1) ? 
        this.sprites.correr2 : this.sprites.correr1;
      }
      else if (this.status == 1) {
        this.element.style.backgroundPositionX = this.sprites.pulando;
        this.element.style.bottom = (parseInt(this.element.style.bottom) + 1) + 'px';
        if (this.element.style.bottom == this.alturaMaxima) this.status = 2;
      }
      else if (this.status == 2) {
        this.element.style.bottom = `${(parseFloat(this.element.style.bottom) - 0.5)}` + 'px';
        if (this.element.style.bottom == '4px') this.status = 0;
      } else if (this.status == 3) {
        this.element.style.width = '55px';
        this.element.style.height = '25px';
        this.element.style.right = '440px';
        this.element.style.backgroundPositionY = '-22px';
        this.element.style.backgroundPositionX = this.element.style.backgroundPositionX === this.sprites.agachar1 ? this.sprites.agachar2 : this.sprites.agachar1;
      }
    }
  }
  class Digito {
    constructor(item, index) {
      this.valor = 0;
      this.element = document.createElement('div');
      this.element.className = 'digito';
      this.element.id = `${index}`;
      this.element.style.backgroundPositionY = '-2px';
      this.element.style.backgroundPositionX = digitosPx[item];
    }
    atualizar(item) {
      this.element.style.backgroundPositionX = digitosPx[item];
    }
  }
  class Pontuacao {
    constructor() {
      this.valor = 0;
      this.element = document.createElement('div');
      this.element.className = 'pontuacao';
      deserto.element.appendChild(this.element);
    }

    zerar() {
      this.valor = 0;
    }

    listarDigitos() {
      this.lista = [];
      let pontos = this.valor.toString(10).split('');
      pontos.forEach(ponto => {
        this.lista.push(parseInt(ponto));
      });

      while (this.lista.length !== 5) {
        this.lista.unshift(0);
      }
      return this.lista;
    }

    adicionarPontos() {
      let index = 0;
      this.lista.forEach(item => {
        const ponto = new Digito(item, index);
        index = index + 1;
        this.element.appendChild(ponto.element);
      });
    }

    incrementar(document) {
      this.valor = this.valor + 1;
      this.listarDigitos();
      for (let i = 0; i < this.lista.length; i = i + 1) {
        const elemento = document.getElementById(`${i}`);
        elemento.style.backgroundPositionX = digitosPx[this.lista[i]];
      }
    }
  }
  class Nuvem {
    constructor(document) {
      this.element = document.createElement('div');
      this.element.className = 'nuvem';
      this.element.style.right = '-50px';
      this.element.style.top = Math.floor(Math.random() * 120) + 'px';
      deserto.element.appendChild(this.element);
    }

    mover() {
      this.element.style.right = (parseInt(this.element.style.right) + 1) + 'px';
    }

    remover() {
      this.element.parentNode.removeChild(this.element);
    }
  }
  class Obstaculo {
    constructor(document) {
      this.tipo = (Math.floor(Math.random() * (+3 - +1)) + +1 === 1) ? 'cactus' : 'peterodactilo';
    }

    mover() {
      this.element.style.right = (parseInt(this.element.style.right) + 1) + 'px';
    }

    remover() {
      this.element.parentNode.removeChild(this.element);
    }
  }
  class Cactus extends Obstaculo {
    constructor(document) {
      var index;
      super();
      this.tipo = 'cactus';
      if (nivel === 0) {
        this.quantidade = 1;
      } else if ( nivel === 1) {
        this.quantidade = Math.floor(Math.random() * (+3 - +1)) + +1  
      } else if ( nivel === 2) {
        this.quantidade = Math.floor(Math.random() * (+4 - +1)) + +1 
      } else {
        this.quantidade = Math.floor(Math.random() * (+5 - +1)) + +1 
      }
      this.tamanho = (Math.floor(Math.random() * (+3 - +1)) + +1 === 1) ? 'grande' : 'pequeno';
      if (this.quantidade >= 0) {
        this.element = document.createElement('div');
        this.element.style.right = '-50px';
        this.element.style.bottom = '0px';
        if (this.tamanho === 'pequeno') {
          index = Math.floor(Math.random() * pequenosCactus[this.quantidade].length);
          this.element.className = 'cactus pequeno';
          this.element.style.backgroundPositionX = pequenosCactus[this.quantidade][index];
          this.element.style.width = pequenosCactus.width[this.quantidade];
          deserto.element.appendChild(this.element);
        } else if (this.tamanho === 'grande') {
          index = Math.floor(Math.random() * grandesCactus[this.quantidade].length);
          this.element.className = 'cactus grande';
          this.element.style.backgroundPositionX = grandesCactus[this.quantidade][index];
          this.element.style.width = grandesCactus.width[this.quantidade];
          deserto.element.appendChild(this.element);
        }
      }
    }
  }
  class Pterodactilo extends Obstaculo {
    constructor(document) {
      super();
      var index = Math.floor(Math.random() * 3); 
      this.baixo = true;
      this.tipo = 'pterodactilo';
      this.element = document.createElement('div');
      this.element.className = 'pterodactilo';
      this.element.style.right = '-50px';
      this.element.style.top = posicoesPtero[index];
      this.element.style.backgroundPositionX = '-136px';
      this.element.style.backgroundPositionY = '-10px';
      deserto.element.appendChild(this.element);
    }

    mover() {
      this.element.style.right = (parseInt(this.element.style.right) + 1) + 'px';
      if (this.baixo) {
        this.element.style.backgroundPositionX = '-182px';
        this.element.style.backgroundPositionY = '-4px';
        this.element.style.height = '26px';
        this.baixo = false;
      } else {
        this.element.style.backgroundPositionX = '-136px';
        this.element.style.backgroundPositionY = '-10px';
        this.element.style.height = '30px';
        this.baixo = true;
      }
    }
  }

  function noiteDia() {
    document.body.style.backgroundColor = document.body.style.backgroundColor === 'black' ?
      'white': 'black';
    document.body.style.wbebkitFilter = document.body.style.wbebkitFilter === 'invert(1)' ? 
      'none' : 'invert(1)';
    document.body.style.filter = document.body.style.filter === 'invert(1)' ? 
      'none' : 'invert(1)';
  }

  function togglePause() {
    if (!paused) paused = true;
    else if (paused) paused = false;
  }

  function escolheObstaculo(document) {
    tipo = (Math.floor(Math.random() * (+3 - +1)) + +1 === 1) ? 'cactus' : 'pterodactilo';
    if (tipo === 'cactus') {
      obstaculos.push(new Cactus(document));
    } else if (tipo === 'pterodactilo') {
      obstaculos.push(new Pterodactilo(document));
    }
  }

  function colisao(obs) {
    const dinox = dino.element.offsetLeft;
    const dinoy = dino.element.offsetTop; 
    const dinow = dino.element.offsetWidth - 10;
    const dinoh = dino.element.offsetHeight - 5;

    const obsx = obs.element.offsetLeft;
    const obsw = obs.element.offsetWidth - 10;
    const obsh = obs.element.offsetHeight;
    const obsy = obs.element.offsetTop + 10;
    
    const colisao1 = (obsx + obsw >= dinox) && (dinox + dinow >= obsx);
    const colisao2 = (obsy + obsh >= dinoy) && (dinoy + dinoh >= obsy);

    return colisao1 && colisao2;
  }

  function endgame() {
    const element = document.createElement('div');
    element.className = 'endgame';
    element.over = document.createElement('div');
    element.over.className = 'over';
    element.restart = document.createElement('button');
    element.restart.className = 'restart';
    dino.element.style.backgroundPositionX = '-855px';
    dino.element.style.backgroundPositionY = '-4px';
    dino.element.style.width = '40px';
    dino.element.style.height = '43px';
    element.appendChild(element.over);
    element.appendChild(element.restart);
    document.body.appendChild(element);
    element.restart.addEventListener('click', function() {
      document.location.href = '';
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') document.location.href = '';
    });

  }

  function run() {
    contador += 1;
    if (nivel <= 1 && contador >= NIVEL_1) {
      exibirObstaculo = true;
      contador = 0;
    } else if (nivel > 5 && contador >= NIVEL_4){
      exibirObstaculo = true;
      contador = 0;
    } else if (nivel <= 5 && contador >= NIVEL_3){
      exibirObstaculo = true;
      contador = 0;
    } else if (nivel <= 2 && contador >= NIVEL_2) {
      exibirObstaculo = true;
      contador = 0;
    }
    if (!paused) {
      dino.correr();
      deserto.mover();

      if (Math.floor(Math.random() * 1000) <= PROB_NUVEM) {
        nuvens.push(new Nuvem(document));
      }
      nuvens.forEach(function (n) {
        n.mover();
        if (n.element.style.right === LIMITE_TELA) n.remover();
      });
      if (exibirObstaculo) {
        escolheObstaculo(document);
        exibirObstaculo = false;
      }
      obstaculos.forEach(function (o) {
        o.mover();
        if (o.element.style.right === LIMITE_TELA) o.remover();
        if (colisao(o)) {
          over = true;
          endgame();
          clearInterval(gameLoop);
          clearInterval(turno);
          clearInterval(scoreLoop);
        };
      });
    }
  }

  function init() {
    deserto = new Deserto(document);
    dino = new Dino(deserto, document);
    pontuacao = new Pontuacao(document);
    pontuacao.listarDigitos();
    pontuacao.adicionarPontos();

    window.addEventListener('keydown', function (e) {
      if (
        e.key === 'ArrowUp' &&
        dino.status === -1 &&
        !over
      ) {
        dino.status = 0;
        aumentaFrames = setInterval(function(e){      
          console.log('NIVEL:', nivel);
          nivel+=1;
          FPS += 70;
        }, (1000 / FPS)*15000);
        gameLoop = setInterval(run, 1000 / FPS);
        turno = setInterval(noiteDia, 60 * 1000);
        scoreLoop = setInterval(function () {
          if (!paused && !over) {
            pontuacao.incrementar(document);
            pontuacao.listarDigitos();
          }
        }, 1000 / 30);
      }
    });
  }

  window.addEventListener('keydown', function (e) {
    var key = e.keyCode;
    if (e.key === 'ArrowUp' && dino.status === 0) dino.status = 1;
    if (key === 40 && dino.status === 0) dino.status = 3;
    if (key === 80) togglePause();
    // else if (e.key == 'ArrowDown' && dino.status==0) dino.status = 3;
  });
  window.addEventListener('keyup', function (e) {
    var key = e.keyCode;
    if (key === 40 && dino.status === 3) dino.status = 0;
  });
  
  init();

})();