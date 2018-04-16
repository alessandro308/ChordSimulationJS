# ChordSimulationJS

<img src="{{ site.url }}/assets/img/post-image/chord.png" style="width: 200px; height: auto; float:left"/>
This project is developed as mid-term for P2P Course, one of my Master Degree's course. The assignment is to develop a chord simulation and analyse the topology and the network performance.
First of all, in order to replay to my colleague, why I've chosen Javascript? Because in the last period I've found various features and libraries that I wanted to try, moreover there was not language constraint on this assignment... so, JAVASCRIPT! 

The project is online [here](https://apagiaro.it/chord/).

## The project

This project borns with the aim to analyze the Chord overlay network topology and routing. We can generate, each time, a Chord graph and performs, from each node, a key lookup. The data generated are stored in a variable that, after some processing, is used to generate the graphs.

The collected statistical data are:
 - Number of noded that a query have to traverse to return the owner of a key
 - The number of links that a node has (in and out-going edges).
 - Number of keys that a node owns
 
 [Read more >>](https://apagiaro.it/ChordSimulatorJS/)
