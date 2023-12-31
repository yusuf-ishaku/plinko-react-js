import { useEffect, useRef, useState } from "react";
import {Engine, Render, Runner, Bodies, Composite,Events,World} from "matter-js";
import image from "../assets/multiplier1.5.png";
import { multiplierImages } from "./multipliers";
import { pots } from "./pots";


export const PlinkoBoard = () => {
    const canvasRef = useRef(null);
    var engine = Engine.create();
    engine.world.gravity.y = 2;
    const [score, setScore] = useState(0);
    const [pegs, setPegs] = useState([]);
    // const [ran, setRan] = useState(0);
    let ran = 0;
    useEffect(() => {
    var render = Render.create({
        element: canvasRef.current,
        engine: engine,
        options: {
            width: 800,
            height: 500,
            wireframes: false,
            // background: '#e0e0e0'
        }
    });
    
    const rows = 10;
    for (let row = 2; row < rows; row++) {
      const pegsInRow = row + 1;
        const spacing = 50;
      for (let i = 0; i < pegsInRow; i++) {
        const x = (i - pegsInRow / 2) * spacing + 400;
        const y = row * spacing + -69;
        const peg = Bodies.circle(x, y, 6, { isStatic: true, label: `${row}`, render: { fillStyle: '#fff' }, restitution: 0.8 });
        pegs.push(peg);
      }
    }
    
    const scores = [];
    const scorePots = 9;
    for (let pot = 0; pot < scorePots; pot++){
      let x = (150) + (55* pot)
      let y = 420
      const newPot = Bodies.rectangle( x , y, 55, 35, {
        isStatic: true,
        label: `point-${pot}`,
        render: {
          fillStyle: pots[pot].color,
          strokeStyle: '#000', // Border color
          lineWidth: 2, 
          text: {
            content: image, // Text to display inside the peg
            color: '#fff', // Text color
          }, 
        },
        restitution: 0.8
      });
      scores.push(newPot)
    }

    const scoreValues = [];
    for (let scoreValue = 0; scoreValue < scorePots; scoreValue++){
      let x = (150) + (55* scoreValue)
      let y = 420
      const newScore = Bodies.rectangle( x , y, 65, 35, {
        isStatic: true,
        label: `point-${scoreValue}`,
        render: {
            sprite: {
              texture: multiplierImages[scoreValue]
            }
        },
        restitution: 0.8
      });
      scoreValues.push(newScore)
    }
    // Create bottom boundary
    const ground = Bodies.rectangle(400, 500, 800, 40, { isStatic: true })
    // add all of the bodies to the world
    Composite.add(engine.world, [...pegs, ...scores,...scoreValues, ground]);
    
    // run the renderer
    Render.run(render);
    
    // create runner
    var runner = Runner.create();
    
    // run the engine
    Runner.run(runner, engine);
    async function onCollideWithMultiplier(ball, multiplier) {
      ball.collisionFilter.group = 2
      World.remove(engine.world, ball)
      // removeInGameBall()
      // const ballValue = ball.label.split('-')[1]
      const multiplierValue = +multiplier.label.split('-')[1] 
      setScore((prevScore) => prevScore + multiplierValue * 4);
      // const multiplierSong = new Audio(getMultiplierSound(multiplierValue))
    }
    const handleBallLanding = async (event) => {
     const pairs = event.pairs;
     for (const pair of pairs){
      const {bodyA, bodyB} = pair;
      if(bodyB.label.includes('ball') && bodyA.label.includes('point'))
        await onCollideWithMultiplier(bodyB, bodyA);
     }
    };
   
    Events.on(engine, 'collisionActive', handleBallLanding);
    return () => {
      World.clear(engine.world, true)
      Engine.clear(engine)
      render.canvas.remove()
      render.textures = {}
    };
       
    }, [engine, score, setScore, ran, pegs]);
    const addBall = () => {
      const values = [300, 330, 360, 390, 440];
      const randomVal = Math.floor(Math.random() * values.length);
      const ball = Bodies.circle(values[randomVal], 20, 7, {
           restitution: 0.6,
           friction: 0.8,
           label: `ball-${20}`,
           id: new Date().getTime(),
           frictionAir: 0.09,
           collisionFilter: {
             group: -1
           },
           render: {
             fillStyle: '#fff'
           },
           isStatic: false
         })
         Composite.add(engine.world, ball);
   }
    const animatePegs = (pegs) => {
      console.log("red")
      const setPegsInRow = (row) => {
        const pegsInRow = pegs.filter((x) => x.label == `${row}`);
        const pegsNotInRow = pegs.filter((x) => x.label !== `${row}`);
       for(let i=0; i < pegsInRow.length; i++){
        pegsInRow[i].render.fillStyle = "#fff"
       }
       for(let i = 0; i < pegsNotInRow.length; i++){
        pegsNotInRow[i].render.fillStyle = 'yellow'
       }
      }
     for(let i = 1; i < 11; i++){
      setTimeout(setPegsInRow, i * 110, i);
     }
     
     setTimeout(setPegsInRow, 1200, 0);
     setTimeout(addBall, 1300);
    }
    const startGame = () => {
      animatePegs(pegs);
    }
   
    return ( 
    <div className="whatever">
      <div className="entry">
      <button onClick={startGame}>
        start game 
      </button>
      <h3>Your score: {score}</h3>
      </div>
    
        <div ref={canvasRef} className="plinko-canvas">

        </div>
    </div>
    )
}