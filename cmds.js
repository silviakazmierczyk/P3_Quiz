const Sequelize = require('sequelize');
const {models} = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");

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
 models.quiz.findAll()
 .each(quiz => {
     log(` [${colorize(quiz.id,'magenta')}]: ${quiz.question} `);
 })
 .catch(error => {
   errorlog(error.message);
 })
 .then(() => {
   rl.prompt();
 });
 };

 

 const validateId = id => {
   return new Sequelize.Promise((resolve,reject) => {
     if (typeof id === "undefined"){
       reject(new Error(`Falta el parámetro <id>.`));
     } else {
       id = parseInt(id);
       if (Number.isNaN(id)){
         reject(new Error(`El valor del parámetro <id> no es un número.`));

       } else {
         resolve(id);
       }
     }
   });
 };
/** 
* Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
* 
* @param id Clave del quiz a mostrar.
*/
exports.showCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
      if (!quiz){
        throw new Error(`No existe un quiz asociado al id=${id}.`);
      }
      log(`[${colorize(quiz.id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
    })
    .catch(error => {
      errorlog(error.message);
    })
    .then(() => {
      rl.prompt();
    });
};

const makeQuestion = (rl, text) => {
  return new Sequelize.Promise((resolve, reject) => {
    rl.question(colorize(text, 'red'), answer => {
      resolve(answer.trim());
    });
  });
};
/** 
* Añade un nuevo quiz al modelo.
* Pregunta interativamente por la pregunta y por la respuesta.
*/
 exports.addCmd = rl => {
 	  makeQuestion(rl, ' Introduzca una pregunta: ')
 	  .then(q => {
 	    return makeQuestion(rl, ' Introduzca la respuesta ')
 	    .then(a => {
 	      return {question: q, answer: a};
 	    });
 	  })
 	  .then(quiz => {
 	    return models.quiz.create(quiz);
 	  })
 	  .then((quiz) => {
 	    log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
 	  })
 	  .catch(Sequelize.ValidationError, error => {
 	    errorlog('El quiz es erróneo:');
 	    error.errors.forEach(({message}) => errorlog(message));
 	  })
 	  .catch(error => {
 	    errorlog(error.message);
 	  })
 	  .then(() => {
 	    rl.prompt();
 	  });
 	};
/** 
* Borra un quiz del modelo.
* 
* @param id Clave del quiz a borrar en el modelo.
*/
exports.deleteCmd = (rl, id) => {
validateId(id)
.then(id => models.quiz.destroy({where: {id}}))
.catch(error => {
  errorlog(error.message);
})
.then(() => {
  rl.prompt();
});
};
/** 
* Edita un quiz en el modelo.
* @param id Clave del quiz a editar en el modelo.
*/
exports.editCmd = (rl, id) => {
   validateId(id)
   .then(id => models.quiz.findById(id))
   .then(quiz => {
     if (!quiz){
       throw new Error(`Ǹo existe un quiz asociado al id=${id}.`);
     }
     process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
     return makeQuestion(rl, ' Introduzca la pregunta: ')
     .then(q => {
       process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
       return makeQuestion(rl, 'Introduzca la respuesta ')
       .then(a => {
         quiz.question = q;
         quiz.answer = a;
         return quiz;
       });
     });
   })
   .then(quiz => {
     return quiz.save();
   })
   .then(quiz => {
     log(`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
   })
    .catch(Sequelize.ValidationError, error => {
 	    errorlog('El quiz es erróneo:');
 	    error.errors.forEach(({message}) => errorlog(message));
 	  })
 	  .catch(error => {
 	    errorlog(error.message);
 	  })
 	  .then(() => {
 	    rl.prompt();
 	  });
};
/** 
* Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
* @param id Clave del quiz a probar en el modelo.
*/
exports.testCmd = (rl,id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
     if (!quiz){
       throw new Error(`Ǹo existe un quiz asociado al id=${id}.`);
         }
         
    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
        
    log(`[${colorize(quiz.id,'magenta')}]: ${quiz.question}: `);
     
    return makeQuestion(rl, ' Introduzca la respuesta: ')
    
    .then(a => {

            if(quiz.answer.toUpperCase() === a.toUpperCase().trim()){

                log("Su respuesta es correcta");

                biglog('Correcta', 'green');

            } else{

                log("Su respuesta es incorrecta");

                biglog('Incorrecta', 'red');

            }

        });
       }) 
     .catch(Sequelize.ValidationError, error => {
 	    errorlog('El quiz es erróneo:');
 	    error.errors.forEach(({message}) => errorlog(message));
 	  })
 	  .catch(error => {
 	    errorlog(error.message);
 	  })
 	  .then(() => {
 	    rl.prompt();
 	  });
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

