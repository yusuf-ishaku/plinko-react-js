import { useEffect, useRef, useState } from "react";
import {Engine, Render, Runner, Bodies, Composite,Events,World}from "matter-js";
import image from "../assets/multiplier1.5.png"


export const PlinkoBoard = () => {
    const canvasRef = useRef(null);
    var engine = Engine.create();
    engine.world.gravity.y = 2;
    const [score, setScore] = useState(0);
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
    const pegs = [];
    const rows = 8;
    for (let row = 1; row < rows; row++) {
      const pegsInRow = row + 1;
        const spacing = 60;
      for (let i = 0; i < pegsInRow; i++) {
        const x = (i - pegsInRow / 2) * spacing + 400;
        const y = row * spacing + -10;
        const peg = Bodies.circle(x, y, 10, { isStatic: true, render: { fillStyle: '#4285f4' }, restitution: 0.8 });
        pegs.push(peg);
      }
    }
    const scores = [];
    const scorePots = 9;
    for (let pot = 0; pot < scorePots; pot++){
      let x = (135) + (60* pot)
      let y = 462
      const newPot = Bodies.rectangle( x , y, 65, 35, {
        isStatic: true,
        label: `point-${pot}`,
        render: {
          fillStyle: "#fff",
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
      let x = (135) + (60* scoreValue)
      let y = 462
      const newScore = Bodies.rectangle( x , y, 65, 35, {
        isStatic: true,
        label: `point-${scoreValue}`,
        render: {
            sprite: {
              texture: image
            }
        },
        restitution: 0.8
      });
      scoreValues.push(newScore)
    }
    // Create bottom boundary
    const ground = Bodies.rectangle(385, 500, 800, 40, { isStatic: true })
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
       
    }, [engine, score, setScore]);
    const addBall = () => {
      const ball = Bodies.circle(400, 20, 10, {
           restitution: 0.8,
           friction: 0.4,
           label: `ball-${20}`,
           id: new Date().getTime(),
           frictionAir: 0.05,
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
    return ( 
    <div className="whatever">
      <div className="entry">
      <button onClick={addBall}>
        start game 
      </button>
      <h3>Your score: {score}</h3>
      </div>
    
        <div ref={canvasRef} className="plinko-canvas">

        </div>
    </div>
    )
}