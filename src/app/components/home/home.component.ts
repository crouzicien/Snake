import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  canvas:any;
  ctx:any;

  canvasP:any;
  ctxP:any;

  echel:number = 20;
  snake:any[] = [[20,20, 'right'], [40,20, 'right'], [60,20, 'right']];
  bush:any[] =  [];
  rock:any[] =  [];
  hole: any[] =  [];
  snakePosX:number = 20;
  snakePosY:number = 20;
  dirX: number = 1;
  dirY: number = 0;
  pommePosX: number;
  pommePosY: number;
  loose: boolean;
  actualDirection: string;
  imgCorpDefault: string;

  imgTetes: any[] = [];
  imgCorp: any[] = [];
  imgQueue: any[] = [];

  imgPomme: { ori: string; img: HTMLImageElement; };
  imgBush: { ori: string; img: HTMLImageElement; };
  imgRock: { ori: string; img: HTMLImageElement; };
  imgHole: { ori: string; img: HTMLImageElement; };

  score:number = 0;
  time: number = 20;
  partieEnCours: boolean = false;
  pommeTimePosX: any = null;
  pommeTimePosY: any = null;
  imgPommeTime: { ori: string; img: HTMLImageElement; };
  dirLocked: boolean;
  

  


  
  constructor() {
    window.addEventListener("keydown", this.direction);
   }

  ngOnInit() {
    
    this.canvas = document.getElementById("snake");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';

    this.canvasP = document.getElementById("pomme");
    this.ctxP = this.canvasP.getContext("2d");
    this.ctxP.fillStyle = 'red';

    this.loadImgs();
  }

 
minutageGo(){
    this.time -= 1;
    setTimeout( ()=> { if(!this.loose) this.minutageGo()}, 1000);
    
}

  commencer(){
    //this.minutageGo()
    this.retry()
  }

  retry(){
    this.snake = [[20,20], [40,20], [60,20]];
    this.snakePosX = 20;
    this.snakePosY = 20;


    this.dirX = 1;
    this.dirY = 0;
    this.score = 0; 
    this.time = 20;
    this.actualDirection = 'right';
    this.partieEnCours = true;
    this.loose = false;
    this.start()
    this.generateBush();
    this.newPomme();
    this.minutageGo()
  }



  start () {
    this.snakePos(this.dirX, this.dirY);
    
    setTimeout(() => {
      if(!this.loose) this.start()
    }, 150);
  }


  direction = (evt) => {
    if(!this.dirLocked){
      if(evt.code === 'ArrowDown' && this.dirY != -1 && this.dirX != 0){
        this.dirX = 0;
        this.dirY = 1;
      }else if(evt.code === 'ArrowUp' && this.dirY != 1 && this.dirX != 0){
        this.dirX = 0;
        this.dirY = -1;
      }else if(evt.code === 'ArrowLeft' && this.dirY != 0 && this.dirX != 1){
        this.dirX = -1;
        this.dirY = 0;
      }else if(evt.code === 'ArrowRight' && this.dirY != 0 && this.dirX != -1){
        this.dirX = 1;
        this.dirY = 0;
      }
    }

    this.dirLocked = true;
  }


  loosing(){
    this.loose = true
  }

  snakePos (x:number, y:number){
        this.dirLocked = false;
        // Ajustement de la progess bar
        let percent = (this.time * 100 ) / 20;
        $('.progress-bar').css('width', percent+'%');

        // Verifie si le temps est terminé
        if(this.time <= 0) this.loosing()
    

        let tete = this.snake[this.snake.length-1];

        //*** TEST DE COLISION DU TOUR D'AVANT ***//
        // Test colision tete -> pomme
        if(tete[0]  === this.pommePosX  && tete[1] === this.pommePosY  ){
          console.log('touché Pomme')
          this.time += 3; 
          this.score += 5; 
          this.popup(this.pommePosX, this.pommePosY, 3)
          this.newPomme();
    
        }else{
          // On supprime le cul
          this.snake.shift();
        }
 
        // Test colision tete -> pommeTime
        if(tete[0]  === this.pommeTimePosX  && tete[1] === this.pommeTimePosY  ){
          console.log('touché PommeTime')
          this.time += 10; 
          this.popup(this.pommeTimePosX, this.pommeTimePosY, 10)
          this.pommeTimePosX = null;
          this.pommeTimePosY = null;
        }
        
        // Test collision bush
        this.bush.map(a=>{
          if(tete[0]  === a[0]   && tete[1] === a[1] + this.echel ){console.log('BUISSON Touché'); this.loosing()}
          if(tete[0]  === a[0] + this.echel  && tete[1] === a[1] + this.echel ){console.log('BUISSON Touché'); this.loosing()}
        })

        // Test collision rock
        this.rock.map(a=>{
          if(tete[0]  === a[0]   && tete[1] === a[1] + this.echel ){console.log('BUISSON Touché'); this.loosing()}
          if(tete[0]  === a[0] + this.echel  && tete[1] === a[1] + this.echel ){console.log('BUISSON Touché'); this.loosing()}
        })

        // Test colision tete -> corps
        this.snake.map(elm => {
          if(elm != tete){
            if (tete[0] === elm[0] && tete[1] === elm[1] ) {
              this.loosing()
              console.log('LOOSE')
            }
          }
        })



    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctxP.clearRect(0, 0, this.canvasP.width, this.canvasP.height);
    this.ctxP.beginPath();



    // Defini la nouvelle direction
    if(this.dirX == 0 && this.dirY == 1) {this.actualDirection = 'down'}
    if(this.dirX == 0 && this.dirY == -1){ this.actualDirection = 'up'}
    if(this.dirX == -1 && this.dirY == 0) {this.actualDirection = 'left'}
    if(this.dirX == 1 && this.dirY == 0) {this.actualDirection = 'right'}
      

        
    // On place la nouvelle tete
    let newTete = [parseInt(tete[0]) + x*this.echel, parseInt(tete[1]) + y*this.echel, this.actualDirection];
    
    // Colision bord de map
    if(newTete[0] >= 500) newTete[0] = 0
    else if(newTete[0] == -20) newTete[0] = 500

    if(newTete[1] >= 500) newTete[1] = 0
    else if(newTete[1] == -20) newTete[1] = 500


    // Colision troue
    let t=0;
    let holeFinish = false;
    this.hole.map( x => {
      if(newTete[0] == x[0] && newTete[1] == x[1] && holeFinish == false){
        console.log('Entrez dans le troue')
        if(t == 0){
          console.log('1st')
          newTete[0] = this.hole[1][0] + this.echel * this.dirX;
          newTete[1] = this.hole[1][1] + this.echel * this.dirY;
          holeFinish = true;
          
        }
        if(t == 1){
          console.log('2nd')
          newTete[0] = this.hole[0][0] + this.echel * this.dirX;
          newTete[1] = this.hole[0][1] + this.echel * this.dirY;
          holeFinish = true;
        }
      }

      
      t += 1;
    })

    this.snake.push(newTete)

    


    // Dessine holes
    this.hole.map(a=>{
      this.ctxP.drawImage(this.imgHole.img, a[0],  a[1], this.echel*1 ,this.echel*1);   
    })
    // Dessine pomme
    this.ctxP.drawImage(this.imgPomme.img, this.pommePosX, this.pommePosY, this.echel ,this.echel);

    // Dessine pommeTime
    if(this.pommeTimePosX != null) {this.ctxP.drawImage(this.imgPommeTime.img, this.pommeTimePosX, this.pommeTimePosY, this.echel ,this.echel);}
    
    // Dessine Rock
    this.rock.map(a=>{
      this.ctxP.drawImage(this.imgRock.img, a[0],  a[1], this.echel*2 ,this.echel*2);   
    })
    // Dessine bushs
    this.bush.map(a=>{
      this.ctxP.drawImage(this.imgBush.img, a[0],  a[1], this.echel*2 ,this.echel*2);   
    })


    // Dessine chaque element du serpent
    let i=0;
    this.snake.map(a => {
     
      // TETE
      if(i == this.snake.length-1){
        this.imgTetes.map(pos => {
          if(pos.ori == this.actualDirection) this.ctx.drawImage(pos.img, a[0],  a[1], this.echel ,this.echel);
        })
      }
      // QUEUE
      else if(i == 0){
        this.imgQueue.map(pos => {
          if(pos.ori == a[2]) this.ctx.drawImage(pos.img, a[0],  a[1], this.echel ,this.echel);
        })
      }
      // CORPS
      else{
        this.imgCorp.map(pos => {
          if(pos.ori == a[2]) this.ctx.drawImage(pos.img, a[0],  a[1], this.echel ,this.echel);
        })        
      }

      i+=1
    })
  }


  popup(x, y, s){
    console.log('popup crée')
    let popup = document.createElement("div"); 
    popup.className = 'popup';
   
    popup.style.left = (x+30) + 'px';
    popup.style.top = (y+30) + 'px';
    popup.textContent = '+ '+s+'s';

    document.body.appendChild(popup); 

    setTimeout(() => {
      document.body.removeChild(popup); 
    }, 1500);
  }


  newPomme () {
    this.pommePosX = (Math.floor(Math.random() * Math.floor(23)) * this.echel) - (this.echel)
    this.pommePosY = (Math.floor(Math.random() * Math.floor(23)) * this.echel) - (this.echel)

    if(this.pommePosX <=0 || this.pommePosY <= 0) this.newPomme()

    // Empeche la generation de pomme sur un buisson
    this.bush.map(x => {
      if(this.pommePosX === x[0] && this.pommePosY === x[1])  this.newPomme()
      if(this.pommePosX === x[0] + this.echel && this.pommePosY === x[1])  this.newPomme()
      if(this.pommePosX === x[0] && this.pommePosY === x[1] + this.echel)  this.newPomme()
      if(this.pommePosX === x[0] + this.echel && this.pommePosY === x[1] + this.echel)  this.newPomme()
    })

    // Empeche la generation de pomme sur un rock
    this.rock.map(x => {
      if(this.pommePosX === x[0] && this.pommePosY === x[1])  this.newPomme()
      if(this.pommePosX === x[0] + this.echel && this.pommePosY === x[1])  this.newPomme()
      if(this.pommePosX === x[0] && this.pommePosY === x[1] + this.echel)  this.newPomme()
      if(this.pommePosX === x[0] + this.echel && this.pommePosY === x[1] + this.echel)  this.newPomme()
    })
    console.log('Nouvelle pomme', this.pommePosX, this.pommePosY)


    // Genere une pomme de temps
    if(this.pommeTimePosX == null){
      let unSurSix = this.entierAleatoire(1, 6)
      console.log(unSurSix)
      if(unSurSix == 4) {this.newTimePomme()}
    }



  }

  newTimePomme (){
    console.log('Nouvelle pommeTime')
    this.pommeTimePosX = (Math.floor(Math.random() * Math.floor(23)) * this.echel) - (this.echel)
    this.pommeTimePosY = (Math.floor(Math.random() * Math.floor(23)) * this.echel) - (this.echel)

    if(this.pommeTimePosX <=0 || this.pommeTimePosY <= 0) this.newPomme()

    // Empeche la generation de pomme sur un buisson
    this.bush.map(x => {
      if(this.pommeTimePosX === x[0] && this.pommeTimePosY === x[1])  this.newPomme()
      if(this.pommeTimePosX === x[0] + this.echel && this.pommeTimePosY === x[1])  this.newPomme()
      if(this.pommeTimePosX === x[0] && this.pommeTimePosY === x[1] + this.echel)  this.newPomme()
      if(this.pommeTimePosX === x[0] + this.echel && this.pommeTimePosY === x[1] + this.echel)  this.newPomme()
    })

    // Empeche la generation de pomme sur un rock
    this.rock.map(x => {
      if(this.pommeTimePosX === x[0] && this.pommeTimePosY === x[1])  this.newPomme()
      if(this.pommeTimePosX === x[0] + this.echel && this.pommeTimePosY === x[1])  this.newPomme()
      if(this.pommeTimePosX === x[0] && this.pommeTimePosY === x[1] + this.echel)  this.newPomme()
      if(this.pommeTimePosX === x[0] + this.echel && this.pommeTimePosY === x[1] + this.echel)  this.newPomme()
    })
    console.log('Nouvelle pomme', this.pommeTimePosX, this.pommeTimePosY)
  }



  generateBush(){
    this.rock = [];
    this.bush = [];

    let nmb = this.entierAleatoire(5, 10)
    
    for (let index = 0; index < nmb; index++) {
      let x = (Math.floor(Math.random() * Math.floor(22)) * this.echel) - (this.echel);
      let y = (Math.floor(Math.random() * Math.floor(22)) * this.echel) - (this.echel);

      // Si la poisition existe déja
      if( this.bush.includes([x, y]) || this.rock.includes([x, y]) ) {
        x = x + 20;
        y = y + -20;
      }
      // Aléatoirement un roché ou un arbre
      let unSurDeux = Math.floor(Math.random() * Math.floor(2));
      if(unSurDeux == 1)  this.bush.push([x, y])
      if(unSurDeux == 0)  this.rock.push([x, y])      
    }



    // Créer les deux trous
    this.hole = [];
    for (let index = 0; index < 2; index++) {
      if(index == 0){
        let x = ( this.entierAleatoire(0, 24) ) * this.echel;
        let y = ( this.entierAleatoire(18, 24) ) * this.echel;
        this.hole.push([x, y])
      }else{
        let x = ( this.entierAleatoire(0, 24) ) * this.echel;
        let y = ( this.entierAleatoire(1, 5) ) * this.echel;
        this.hole.push([x, y])     
      }
      console.log('Troue créer')
    }

    // Deplace la generation de buisson et de la pierre si est sur le corp du serpent
    this.bush.map(x => {
      console.log('Buisson', x[0], x[1])
      if(x[1] == 20 || x[1] == 0 || x[1] == 10) { x[1] += 40 ; console.log('déplacement de buisson')}
    })
    this.rock.map(x => {
      console.log('Roché', x[0], x[1])
      if(x[1] == 20 || x[1] == 0 || x[1] == 10) {x[1] += 40 ; console.log('déplacement de roché')}
    })
  }


  entierAleatoire(min, max)
  {
   return Math.floor(Math.random() * (max - min + 1)) + min;
  }





  loadImgs(){
    let img1 = new Image();
    img1.src = "assets/img/teteUp.png";
    this.imgTetes.push( {ori : 'up', img : img1 })

    let img2 = new Image();
    img2.src = "assets/img/teteDown.png";
    this.imgTetes.push( {ori : 'down', img : img2 })

    let img3 = new Image();
    img3.src = "assets/img/teteRight.png";
    this.imgTetes.push( {ori : 'right', img : img3 })

    let img4 = new Image();
    img4.src = "assets/img/teteLeft.png";
    this.imgTetes.push( {ori : 'left', img : img4 })

    let img6 = new Image();
    img6.src = "assets/img/appleRed.png";
    this.imgPomme = {ori : 'pomme', img : img6 }

    let img7 = new Image();
    img7.src = "assets/img/bush.png";
    this.imgBush = {ori : 'bush', img : img7 }

    let img8 = new Image();
    img8.src = "assets/img/rock.png";
    this.imgRock = {ori : 'rock', img : img8 }

    let img9 = new Image();
    img9.src = "assets/img/corpUp.png";
    this.imgCorp.push ({ori : 'up', img : img9 })

    let img10 = new Image();
    img10.src = "assets/img/corpDown.png";
    this.imgCorp.push( {ori : 'down', img : img10 })

    let img11 = new Image();
    img11.src = "assets/img/corpRight.png";
    this.imgCorp.push( {ori : 'right', img : img11 })

    let img12 = new Image();
    img12.src = "assets/img/corpLeft.png";
    this.imgCorp.push( {ori : 'left', img : img12 })

    let img13 = new Image();
    img13.src = "assets/img/queueLeft.png";
    this.imgQueue.push( {ori : 'left', img : img13 })

    let img14 = new Image();
    img14.src = "assets/img/queueRight.png";
    this.imgQueue.push( {ori : 'right', img : img14 })

    let img15 = new Image();
    img15.src = "assets/img/queueUp.png";
    this.imgQueue.push( {ori : 'up', img : img15 })

    let img16 = new Image();
    img16.src = "assets/img/queueDown.png";
    this.imgQueue.push( {ori : 'down', img : img16 })

    let img17 = new Image();
    img17.src = "assets/img/hole.png";
    this.imgHole = {ori : 'hole', img : img17 }

    let img18 = new Image();
    img18.src = "assets/img/bananas.png";
    this.imgPommeTime = {ori : 'pommeTime', img : img18 }
  }
  
}
