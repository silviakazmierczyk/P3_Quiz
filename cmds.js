
const {log, biglog, errorlog, colorize} = require('./out');
const model = require('./model');

/** 
* Muestra la ayuda.
*/
exports.helpCmd = rl => {
          log("Comandos:");
          log(" h|help - Muestra esta ayuda.");
          log(" list - Listar los quizzes existentes.");
          log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado");
          log(" add - Añadir un nuevo quiz interactivamente.");
          log(" delete <id> - Borrar el quiz indicado.");
          log(" edit <id> - Editar el quiz indicado.");
          log(" test <id> - Probar el quiz indicado.");
          log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
          log(" credits - Créditos.");
          log(" q|quit - Salir del programa.");
          rl.prompt();
}; 

/** 
* List todo slos quizzes existentes en el modelo.
*/
exports.listCmd = rl => {
    model.getAll().forEach((quiz, id) => {
        
        log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
}
/** 
* Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
* 
* @param id Clave del quiz a mostrar.
*/
exports.showCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog(`El parámetro id no es válido.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }
    
    rl.prompt();
};
/** 
* Añade un nuevo quiz al modelo.
* Pregunta interativamente por la pregunta y por la respuesta.
*/
exports.addCmd = rl => {
    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize( ' Introduzca la respuesta ', 'red'), answer => {
            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });
    
};
/** 
* Borra un quiz del modelo.
* 
* @param id Clave del quiz a borrar en el modelo.
*/
exports.deleteCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        }catch(error){
            errorlog(error.message);
        }
    }
    
    rl.prompt();
}
/** 
* Edita un quiz en el modelo.
* @param id Clave del quiz a editar en el modelo.
*/
exports.editCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            
            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
                
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                
                rl.question(colorize(' Introduzca una respuesta ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        }catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }
      
};
/** 
* Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
* @param id Clave del quiz a probar en el modelo.
*/
exports.testCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            rl.question(colorize(quiz.question + '? ', 'red') , response => {
                if (response.toLowerCase().trim() === quiz.answer.toLocaleLowerCase().trim()){
                    log('Su respuesta es correcta.');
                    biglog('Correcta', 'green');
                    rl.prompt(); 
                }else{
                    log('Su respuesta es incorrecta.');
                    biglog('Incorrecta', 'red');
                    rl.prompt(); 
                }
            });
                
            rl.prompt();
            
        }catch(error){
            errorlog(error.message);
            rl.prompt(); 
        }   
    }
};
/** 
* Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
* Se gana si se contesta a todos satisfactoriamente.
*/
exports.playCmd = rl => {
    let score = 0;
    var i;
    let toBeResolved = new Array(model.count());
    for (i = 0; i<toBeResolved.length; i++){
        toBeResolved[i] = i;
    }
     const playOne = () => {
       if (toBeResolved.length === 0){
          log(`No hay nada más que preguntar.`);
          log(`Fin del juego. Aciertos: ${score}`);
          biglog(score, 'magenta');
       }else{
          let id = Math.floor(Math.random()*(toBeResolved.length-1));
          let quiz = model.getByIndex(toBeResolved[id]);
          toBeResolved.splice(id,1);
            rl.question(colorize(quiz.question + '? ', 'red') , response => {
                if (response.toLowerCase().trim() === quiz.answer.toLocaleLowerCase().trim()){
                    score++;
                    log(` CORRECTO - Lleva ${score} aciertos`);
                    playOne(); //recursiva
                }else{
                    log('INCORRECTO.');
                    log(`Fin del juego. Aciertos: ${score} `);
                    biglog(score, 'magenta');
                    rl.prompt();
                }
            });
         } 
         rl.prompt();
        };
        playOne();
}
/** 
* Muestra los nombres de los autores de la practica.
*/
exports.creditsCmd = rl => {
      console.log('Autores de la práctica:');
      console.log('Sylwia');
    rl.prompt();
}
/** 
* Terminar el programa.
*/
exports.quitCmd = rl => {
      rl.close();
    rl.prompt();
}

