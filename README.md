# Quick Art
A competitive drawing game where you race against others in real time to draw according to a prompt and the drawing that is guessed first by a ml algorithm wins! 

!["Project Diagram"](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/569/601/datas/gallery.jpg)
## Mission
Our mission was to create a art themed game that people can enjoy. We wanted to also make it competitive so people can play with their friends. 
## Summary
In this project you are given a prompt of what to draw. You and 2 other players must race to see who can draw it first. You get to see real time updates of what the other users are drawing as well. We used a model that takes users drawings and predicts what they are. This allows for a high accuracy method for predicting the winner.
## Technologies
We built the frontend with react, backend with nodejs, and a flask server which houses the model. The frontend and backend communicate via web sockets which allow for real time updates between users. The backend communicates with the flask server to retrieve the predictions that the model creates.
## Challenges
There were many challenges when it came to incorporating websockets. Since there are many messages coming in, and the state of the application is constantly updating, it takes a lot of planning and testing to create a working application where there are multiple games happening at once, and multiple clients are communicating within the same game room multiple times per second.
## What are we most proud of?
We are proud that the project came together. The queuing system works, the users can draw and see updates in real time, then they send their canvas data to the backend which is evaluated by the AI, and it determines the winner.
## One thing you learned about?
We learned a lot about how websockets work and how to create a multiplayer game where players can communicate quickly through the web, bypassing the limits of HTTP. Also we learned that using AI models is not an easy thing, but it is very rewarding. To use it, there were many dependencies we had to install, and we had to clean and format the data before it was acceptable to the model. The images had to be in a specific format 28 x 28 and only black and white pixels. This helped us learn about how data is processed and how it has to be consistent for the model to give accurate results.
## What's next?
We are hoping to make it more scalable, allow users to sign up, save their progress, and have a real time leader board. We want to time the games, so users can have a log of their best games, and their quickest drawings. It would be more fun and rewarding for users.

## How to run the project

## Frontend
    cd frontend
#### install dependencies
    npm install
#### run
    npm start

## backend & flask server
    cd backend
#### Run with docker
    docker-compose up --build
