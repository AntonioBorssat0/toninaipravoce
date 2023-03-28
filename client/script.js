//Importa os ícones de bot e usuário
import bot from './assets_codex/assets/bot.svg';
import user from './assets_codex/assets/user.svg';

//traz o que tiver no form do html aqui pra essa variável chamada form
const form = document.querySelector('form');
//traz o que tiver no chatContainer do html aqui pra essa variável chamada chatContainer
const chatContainer = document.querySelector('#chat_container');
//obs: a div de form é a parte onde o usuário digita a pergunta e o chatContainer é parte com os strips do usuário e do bot, ou seja, o chat com as conversas 

//variável que será o load de três pontinhos enquanto o bot pensa.
let loadInterval;

//função que cria a animação dos três pontinhos. A cada 300 milisegundos um pontinho é adicionado e quando chega em 3 a animação reinicia.
function loader(element){
  element.textContent = '';
  
  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....'){
      element.textContent = '';
    }
  }, 300)
}

//função que cria a animação de cada letra ser escrita por vez pelo bot. A cada 20 milisegundos uma letra é digitada pelo bot
function typeText (element, text){
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

//função que gera um Id único para cada mensagem do bot.
function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//cria os chat strip para o usuário e para o bot.
function chatStripe (isAi, value, uniqueId){
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">  
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt=${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

//Essa função cria executa e coloca na tela os strip do usuário e do bot
const handleSubmit = async (e) => {
  //previne que o navegador tente executar o comportamento padrão do site
  e.preventDefault();
  //traz o que foi escrito no form
  const data = new FormData(form);

  //user's chatstripe
  //cria o strip do usuário e reseta o campo do form após o submit
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //bot's chatstripe
  //gera o id único
  const uniqueId = generateUniqueId();
  //cria o strip do bot
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  //coloca a nova mensagem do bot em visão principal para ser lida
  chatContainer.scrollTop = chatContainer.scrollHeight;
  //salva a mensagem do bot nessa variável, buscando a mensagem pelo id único
  const messageDiv = document.getElementById(uniqueId);
  //liga a função dos três pontinhos
  loader(messageDiv);

  //Busca os dados do server, ou seja, a resposta do bot
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    
    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

//executa toda a função handleSubmit quando o usuário clica em submit.
form.addEventListener('submit', handleSubmit)
//executa toda a função handleSubmit quando o usuário clica a tecla Enter (keycode =13).
form.addEventListener('keyup', (e) =>{
  if (e.keyCode === 13)  {
    handleSubmit(e);
  }
})