import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import { App } from '@wazo/euc-plugins-sdk';
const app = new App();

const domain = 'sp-intjit.wazo.io';
const welcome = document.getElementById("p-welcome");
const roomName = document.getElementById("MeetroomName");

let MeetroomName = "default";
let firstname;
let lastname;
let email;
let MeetlabelName = "Wazo Meeter";

const meet = document.getElementById("meet"); 
const preloader = document.querySelector('#preloader');

//class pour convertir les timestamp pour lhistorique des conférences
class DateFormatter {
    constructor(timestamp) {
      this.date = new Date(timestamp);
    }
  
    formatFrench() {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      };
  
      return this.date.toLocaleDateString('fr-FR', options);
    }
}

// fonction pour generer un ID devant chaque conf générée
const generateRandomId = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
    for (let i = 0; i < 5; i++) {
      randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomId;
  }

  //function de stockage en localstorage les conférénces réalisées
const logInStorage = (MeetroomName) => {
        let conference = 'https://' + domain + '/' + MeetroomName;
        let date = new Date().getTime();
        let duration = null;
        const newEntry = { conference, date, duration };

        // Vérification du stockage existant
        let storedEntries = JSON.parse(localStorage.getItem('features/recent-list')) || [];
        storedEntries.push(newEntry);
        localStorage.setItem("features/recent-list", JSON.stringify(storedEntries));
}

// Fonction pour afficher les données du localStorage
const afficherDonnees = () => {
    const div = document.getElementById("histo1");
    const div2 = document.getElementById("histo2");
    let storedEntries = JSON.parse(localStorage.getItem('features/recent-list')) || [];
    //on trie les dates dans le sens décroissant
    storedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    for (let i = 0; i < storedEntries.length; i++) {
        // Création d'une nouvelle div pour chaque élément
        const url = storedEntries[i].conference;
        const extractedPart = url.split('/').pop();
        const dateFormatter = new DateFormatter(storedEntries[i].date);
        const formattedDate = dateFormatter.formatFrench(); 
        if (i >= 4 && i <=7) {
            const divData = `<div class="resume-item pb-0">
              <h4>${extractedPart}</h4>
              <p class="t-small">${formattedDate}</p>
              <p><i class="fa-solid fa-circle-nodes fa-lg text-success c-pointer" data-connect="${extractedPart}"></i> <i class="ml-5 fa-solid fa-copy fa-lg text-primary c-pointer" data-copy="${storedEntries[i].conference}"></i> <i class="ml-5 fa-solid fa-trash fa-lg text-danger c-pointer mr-5" data-remove="${storedEntries[i].conference}"></i></p>
              <ul>
                <li>${storedEntries[i].conference}</li>
              </ul>
            </div>`;
            div2.innerHTML += divData;
        }
        if (i <= 3) {
            const divData = `<div class="resume-item pb-0">
              <h4>${extractedPart}</h4>
              <p class="t-small">${formattedDate}</p>
              <p><i class="fa-solid fa-circle-nodes fa-lg text-success c-pointer" data-connect="${extractedPart}"></i> <i class="ml-5 fa-solid fa-copy fa-lg text-primary c-pointer}" data-copy="${storedEntries[i].conference}"></i> <i class="ml-5 fa-solid fa-trash fa-lg text-danger c-pointer mr-5" data-remove="${storedEntries[i].conference}"></i></p>
              <ul>
                <li>${storedEntries[i].conference}</li>
              </ul>
            </div>`;
            div.innerHTML += divData;
        }
        
    }
}

// écouteur délégation d'événements click
document.addEventListener('click', (e) => {
    // Vérifie si l'élément cliqué a la classe .fa-copy
    const icon = e.target.closest('.fa-copy');
    const connect = e.target.closest('.fa-circle-nodes');
    const remove = e.target.closest('.fa-trash');
    const GoMeet = e.target.closest('.btn_submit');
    if (icon) {
        console.log('Icône cliquée !');
        const text = icon.getAttribute('data-copy');
        if (text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    const parentParagraph = icon.parentElement;
                    let copiedMessage = parentParagraph.querySelector('.copied-message');

                    // Vérifie si un message existe déjà, pour éviter les doublons
                    if (!copiedMessage) {
                        copiedMessage = document.createElement('span');
                        copiedMessage.className = 'copied-message text-success ml-2'; 
                        copiedMessage.textContent = 'Copié !';
                        parentParagraph.appendChild(copiedMessage);

                        // Retire après 2 secondes
                        setTimeout(() => {
                            copiedMessage.classList.add('fade-out');
                            setTimeout(() => copiedMessage.remove(), 500); // Retirer complètement après l'animation
                        }, 2000);
                    }
                })
                .catch(err => {
                    console.error('Erreur lors de la copie : ', err);
                });
        } else {
            console.warn('Attribut data-copy manquant.');
        }
    }
    if (connect) {
        const text = connect.getAttribute('data-connect');        
        MeetlabelName = firstname + ' ' + lastname;
        runMeet(text, MeetlabelName);
    }
    if (remove) {
        const room = remove.getAttribute('data-remove');
        let storedEntries = JSON.parse(localStorage.getItem('features/recent-list')) || [];
        const updatedEntries = storedEntries.filter(entry => entry.conference !== room);
        localStorage.setItem('features/recent-list', JSON.stringify(updatedEntries));

        console.log('Entrée supprimée de localStorage : ' + room);
        // Supprime l'élément HTML correspondant
        const resumeItem = remove.closest('.resume-item');
        if (resumeItem) {
            resumeItem.remove();
            console.log('Élément supprimé de l\'affichage.');
        }

    }
    if (GoMeet) {
        e.preventDefault;
        preloader.style.display = 'inline';
        let name = roomName.value;
        (name === undefined)? MeetroomName = MeetroomName : MeetroomName = name ;
        MeetlabelName = firstname + ' ' + lastname;
        logInStorage(MeetroomName);
        runMeet(MeetroomName, MeetlabelName);
    }
});

afficherDonnees();


const runMeet = async (roomName, labelName) => {
    preloader.style.display = 'inline';
    const options = {
        roomName: roomName,
        // width: 700,
        // height: 700,
        parentNode: document.querySelector('#meet'),
        lang: 'fr',
        userInfo: {
            email : email,
            displayName: labelName
        },
        welcomePageEnabled: false,
        enableClosePage: true,
        configOverwrite: {
            'enableClosePage': true
        }
            
    };
    const api = new JitsiMeetExternalAPI(domain, options);
    
    meet.style.display = 'inline';
    preloader.style.display = 'none';
}

(async()=>{
    await app.initialize();
    const context = app.getContext();
    console.log(context);
    firstname = context.user.profile.firstName;
    lastname = context.user.profile.lastName;
    email = context.user.profile.email;
    
    let p_html = 'Bienvenue <span class="typed" data-typed-items="Wazer, Meeter, Wazo Meeter, '+firstname + ' ' + lastname + '"></span><span class="typed-cursor typed-cursor--blink" aria-hidden="true"></span>';
    welcome.innerHTML += p_html;
    const selectTyped = document.querySelector('.typed');
    if (selectTyped) {
        let typed_strings = selectTyped.getAttribute('data-typed-items');
        typed_strings = typed_strings.split(',');
        new Typed('.typed', {
        strings: typed_strings,
        loop: false,
        typeSpeed: 90,
        backSpeed: 40,
        backDelay: 1500
        });
    }
    const idRoom = generateRandomId();
    roomName.value = idRoom + '-' + firstname + '-' + lastname;
}
)();

