import React, { useRef, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './MultiplayerStyles.css';
import { io, Socket } from 'socket.io-client';

type Point = {
  x: number;
  y: number;
}

function MultiplayerGame() {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    // each user will belong to a room which will allow
    // communication between them and the other users
    // in their team.
    const [roomName, setRoomName] = useState("");
    // id that is constant when re-rendre hapens
    const userId = useRef(uuidv4()).current; 
    const socketRef = useRef<any | null>(null);
    // this will hold the points data to send to other clients thru socket.
    const pointsBufferRef = useRef<Point[]>([]);


    // references to all user canvases in the game. We access them to draw on them.
    const [usersCanvas, setUsersCanvas] = useState({ [userId]: React.createRef<HTMLCanvasElement>() });

    // only send the canvas blob if there are changes.
    const hasChangesRef = useRef(false);

    useEffect(() => {
      socketRef.current = io('http://localhost:5000');
  
      // Join the game
      socketRef.current.emit('joinGame', userId);
  
      // Listen for other users joining
      socketRef.current.on('userJoined', (newUserId: string) => {
          setUsersCanvas(prev => ({ ...prev, [newUserId]: React.createRef() }));
      });

    // this server draw method is efficient since it only draws the differences
    // but it has very small inaccuracies. Its probably better to just get the
    // datablob and re-draw the canvas using the blob although much slower. 

    //   socketRef.current.on('serverDraw', (data: any) => {
    //     console.log('works?')
        
    //     // Update state using a function to get the latest state
    //     setUsersCanvas(prevUsersCanvas => {

    //         const canvasRef = prevUsersCanvas[data.userId];
    //         if (!canvasRef) return prevUsersCanvas;
            
    //         if (data.points.length === 0) return prevUsersCanvas;
    
    //         console.log("Got POINTS", data.points);
            
    //         if (canvasRef.current) {
    //             const ctx = canvasRef.current.getContext('2d');
    //             if (ctx) {
    //                 ctx.beginPath();
    //                 // save old color & widths before drawing
    //                 // on other canvas. then return to the
    //                 // old color and line width after.
    //                 let color = ctx.strokeStyle;
    //                 let lineWidth = ctx.lineWidth;

    //                 ctx.strokeStyle = data.color;
    //                 ctx.lineWidth = data.lineWidth;
    //                 ctx.moveTo(data.points[0].x, data.points[0].y);
    
    //                 for (let i = 1; i < data.points.length; i++) {
    //                     ctx.lineTo(data.points[i].x, data.points[i].y);
    //                     ctx.stroke();
    //                     ctx.beginPath();
    //                     ctx.moveTo(data.points[i].x, data.points[i].y);
    //                 }
    //             ctx.strokeStyle = color; 
    //             ctx.lineWidth = lineWidth;
    //             }
    //         }
    //         return prevUsersCanvas; // Return the previous state if there are no changes
    //     });
    // });
    
    socketRef.current.on('serverDraw', (data: any) => {
      console.log('Received canvas blob data from server.', data.blob);
  
      setUsersCanvas(prevUsersCanvas => {
          const canvasRef = prevUsersCanvas[data.userId];
          if (!canvasRef) return prevUsersCanvas;
  
          if (canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                const blob = new Blob([data.blob], { type: 'image/png' });
                  const objectURL = URL.createObjectURL(blob);
                  const currentCanvas = canvasRef.current;
                  let img = new Image();
                  img.onload = function() {
                    if (currentCanvas){

                      ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
                      ctx.drawImage(img, 0, 0);
                      URL.revokeObjectURL(objectURL)

                    }
                  };
                  img.src = objectURL;

                }
            }
            return prevUsersCanvas;
          });
        });
  

    // this will get all previous users if there are any and
    // add them to the list.

    socketRef.current.on('previousUsers', (userList: string[]) => {
      let newUsersCanvas = { ...usersCanvas };
      userList.forEach(userId => {
          if (!newUsersCanvas[userId]) {
              newUsersCanvas[userId] = React.createRef();
          }
      });
      setUsersCanvas(newUsersCanvas);
  });
  
  
    socketRef.current.on('assignedRoom', (assignedRoomName: any) => {
      setRoomName(assignedRoomName);
    });

      return () => {
        socketRef.current.disconnect();
      }
  }, []);


    useEffect(() => {
      const canvas: HTMLCanvasElement | null = canvasRef.current;
      if (canvas === null) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.lineWidth = 1; // Initial settings
      ctx.strokeStyle = 'black';
      ctx.lineCap = 'round'; // Round end caps for lines
    }, []);

    useEffect(() => {
      const canvas: HTMLCanvasElement | null = canvasRef.current;
      if (canvas === null) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

        const startDrawing = () => setIsDrawing(true);
        const stopDrawing = () => {
            setIsDrawing(false);
            ctx.beginPath();

            hasChangesRef.current = true;

            // sending the accumulated start to finish data thru the socket.
            // this works with high accuracy but there are some small pixel
            // differences so ill just send the blob 

            // socketRef.current.emit('draw', { userId, roomName,  points: pointsBufferRef.current, color: ctx.strokeStyle, lineWidth: ctx.lineWidth });

            // Clear the buffer
            pointsBufferRef.current = []
        };

      // this function will take all of the changes and then
      // re-render the clients page, and then  send to others
      // and the colors as well (black, white) and then
      // send it to the other clients so they can re-render
      // their screens with the data.
        const draw = (event: MouseEvent) => {
            if (!isDrawing) return;

            const x = event.clientX - canvas.offsetLeft;
            const y = event.clientY - canvas.offsetTop;

            pointsBufferRef.current.push({ x, y });

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mousemove', draw);

        const intervalId = setInterval(() => {
          if (hasChangesRef.current) {
              canvas.toBlob((blob) => {
                  socketRef.current.emit('canvasData', { blob, userId, roomName: roomName });
                  hasChangesRef.current = false; // Reset the flag after sending the data
              }, 'image/png');
          }
         }, 2000); // Every 2 seconds

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mousemove', draw);
        };
    }, [isDrawing]);

    const toggleEraser = (tool: string) => {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        if (canvas === null) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (tool === 'pencil') {
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            setIsErasing(false);
        } else {
            ctx.lineWidth = 18;
            ctx.strokeStyle = 'white';
            setIsErasing(true);
        }
    };

    return (
        <div className='canvasContainer'> 
        
          {/* map all canvases. Then add a different class for the */}
          {/* users canvas and then also a ref for it so they can draw */}
          {/* on it but not draw on the others. */}
          {Object.keys(usersCanvas).map((canvasUserId) => (
            <span className='canvasOuter'>
              {canvasUserId === userId && <span><img style={{backgroundColor: !isErasing ? 'black' : 'white'}} onClick={()=>{toggleEraser('pencil')}} className='pencil' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADEElEQVR4nO3VyU8TcRjG8ZfFRPQEJyHBkxfjzcTEu/F/UDFET9BO2qHtAAf+B/eDEKOoaFC2qlgXYrkYQQJY6L4MBTrdZqZtJLIe+pgBSRpELUrLjOk3ee+f55dMhqhUKe21OkbXNyYpjFE6TFrEY5YAJ2FjmiKaGpGLh5sAD2H9i0ZG7IbPeglZH2F9VuUj1sbp1q/w2QAhGyR8m6BPGKVK0tLLZ3/gV6YIKTsh9YH6VDViT3i7ykb8Fd6ukhH/hLfnjJikQ9rE2w9oxL7i7VsXt5aN4TlVaRM/WI7Ig0rEnlYI0Zd0RJN4obsS0YcViPeWCyjEiGLgY48qEH9cjkRf2f6OWBv78x923/A95Ugq11e2oL2X79nCi0/KIA3R7RIeWn35Fcfp15rFf5W/XN1wVP8Wv1wY/I1/xstLSyfTmcxqKp3BivustvBKqUzmloKXU2lIcgrrrmrt4JVS6bR/Gy9KMjKhDu3gRVGszcUnRAlidFzdH2xuUjrdkIuPJyXEEiKWp6vU/fLbSbLctRMfjSchxBKIRHgIoX4kJ87vB/4mFSJRkoO74qNxLEZjWBCimI8IiM60qw8vSVJdPvjwooC5hQgS4+fUg1dKJKTL+eL5+UXMe3rVg1eKJaV7+eJD4QWEeHfeeHmI7lChez8y8jlffHBuHn4+jLj16J9ffpCuFRzf0dFR39bWlrW9eZc33heagzfIw++yY+5jG2L9NQeDV+I4rrG1tRXKDdtseeM9AR5ufwguXxBObwCC7Uwu/joVK47j7nMcB4vFArPZjJfDw3vGz3r8mHH7kBioQcx26j0VM4vFElbwJpMJLS0tm2d98WrPeIfLuzw7+bahqPj29vbjuXiWZWE0GjdvYMiaJ97rdji916ZcrhNU7Mxm85WdeIPBAIZhNq9vYPBnvDfIO72BTofH3+h0BuvpIDOZTN274fV6PXQ6HZqamrL9Q9Yxd4DvdPlDFz0eTy2pKZZl+V3wPp1Od7e5ufmCXq8/RmqOZdlnRqPRbzAYuhiGucQwTN1Bm0qVKvWf9h2q7FYY+Mr0QgAAAABJRU5ErkJggg=="></img></span>}
              {canvasUserId === userId && <span><img style={{backgroundColor: isErasing ? 'black' : 'white'}} onClick={()=>{toggleEraser('eraser')}} className='eraser' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC4klEQVR4nO2W30/TUBTHL7yQaUwE/z8ffeNhuxAITIREHw0xJm7E+MSLIYZ20BDDUmDQFhjd7X6UbRRipFINwShRE83mdkzRsrEV3NafS/ZNzlsfPp+ee869CPXSSy+eRQ0GAxrGrzSMP55gPP8J49uoW6IMDw9ooRCjYQxGnYRC3Nno6B3UjfBat0jcBK/5XaIVeM2vEu3Aa36T6ARe84vExaoMheKdwGteSwiqGlDD4TdW4LWaRMLVe0JRlAFSOGQye1JZnZg4t0NCw/i1q/BS8Qj0yooSqFNTJctdwPi74/ALghDg0/K8AX9FYnraagdijsKvrKwMUCzHxNZ54CT5tFEiI6ZBnZnpFJ6oweCQo3+eYrk4vcaDXrrElpQr2SRBHIXXt02CZOZplisZAoYEJ+XAogRxHF4qHMZ1ME7KndMsX7ZRgrgGbxQvyVWa5So2SBDHzzyT2FlMFQ4/NILxaRlolqu2LDH1qOTZwC5v7PwWZeXMTCJWJ/A/iZPJyS+uwItLc7eoNX61HmxpYxtEWfnWigS9LgBHZDOJshoOx4/Hxwcdg4enKABzfavC8iy5AvVPIikflNroRLn+O1I4IrKsDjkLH0FxiCKAaB8kY4/fm0ns5orV1mdCPvUA3qg+SNEPP5t2IleEayQqjcdJSOepbPZ40GX4moREjf1slFjWO5EtNHfiYsXW7gmK5cjCW8HtP98skaZGKmYSSbnYNBN/Lzuu5BN4dCmRoUagSSKxDXv7Bz8aJTZTWZrZ2vLq2NzQiUXzToj7B5cvU31gd/P5ez6DR7WZWBz71SwhVFJ55dijbYPaqmq0H/ZiM18bJZjNXdbRbaMHIui+Ffj6TiSXnrxzbdvUB6JozC4JnnkmugpvBCJo2g6JSqQ/uU7N3kVeBKx3gsBL5O6ft1HCe3gLEv6B70DCf/BtSPgXvgUJ/8PfINE98CYSBJ4j5x5mTgai6AG8QM6+bXrpBTmeP+xTb/j5t/eNAAAAAElFTkSuQmCC"></img></span>}

                <canvas 
                  key={canvasUserId} 
                  ref={canvasUserId === userId ? canvasRef : usersCanvas[canvasUserId]} 
                  className={(isErasing ? 'canvas-eraser ' : 'canvas-pen ' ) + (canvasUserId === userId ? "userCanvas currentUserCanvas" : "userCanvas")} 
                  width={270} 
                  height={270}
                ></canvas>
            </span>
          ))}
        
        </div>
    );
}

export default MultiplayerGame;
