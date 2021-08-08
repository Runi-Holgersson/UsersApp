`use strict`;

let userCardArr = [];
const req = new Request(`https://api.randomuser.me/1.0/?results=50&nat=gb,us&inc=gender,name,location,email,phone,picture`)
const getData = async () => {
    const data = await fetch(req, {
        mode: "cors"
    });
    if (data.ok) {
        return data.json();
    } else throw new Error(`Данные не были получены, ошибка ${data.status}:${data.statusText}`);
};
const getUserList = (callback) => {
    getData()
        .then(data => callback(data.results))
        .catch(err => console.log(err));
};

document.addEventListener(`DOMContentLoaded`, () => {
    //каждому юзеру добавляется свойство
    // с объектом с классом для рендера карты и ид
    let newArr = [];
    const cardOverlay = document.querySelector(`.modal-overlay`);

    const addUserCard = (dataArr) => {
        //тут попробуй по уму сделать
        newArr = [];
        dataArr.map((user, id) => {
            user = new UserCardPreview(user, id, `card`, `li`);
            newArr.push(user);
        });
        return newArr;
    }
    //рендер списка при загрузке страницы
    const renderList = (data) => {
        addUserCard(data);
        const userList = document.querySelector(`.users__list`);

        newArr.forEach((user) => {
            const card = user.createCard(`medium`);
            card.append(user.createBtn(`..show more info`, `modal-open`));
            userList.append(card);
        })
        //открытие модального окна
        userList.addEventListener(`click`, (e) => {
            const target = e.target;
            if (target.classList.contains(`modal-open`)) {
                const cardFullInfoElement = document.querySelector(`.card_full-info`);
                const id = target.closest(`.card`).dataset.id;
                const user = newArr[id].user;
                const cardFullInfo = new UserCard(user, id, `card_full-info`, `div`);
                console.log(cardFullInfo);
                const fullCard = cardFullInfo.createCard(`large`);
                cardFullInfoElement.innerHTML = ``;
                openModalCard();
                //селекторы потом менять будешь
                cardFullInfoElement.append(fullCard);
                //закрытие модального окна
                cardOverlay.addEventListener(`click`, (event) => {
                    if (event.target == cardOverlay) {
                        closeModalCard();
                    }
                });
                //добавь по эскейпу закрытие и по кнопке(кстати где она)

            }
        })
    }

    function openModalCard() {
        cardOverlay.classList.add(`modal-overlay_open`);
        //disableScroll();
    }

    function closeModalCard() {
        cardOverlay.classList.remove(`modal-overlay_open`);
        //enableScroll();
    }

//!!прям важно, попробуй в коллбэк кидать addUserCard ,сразу  элементам датаArr навешивать прототип,
// а потом вызывать рендерлист. это как-то гибче выглядит
    getUserList(renderList);

    class UserCardPreview {
        constructor(user, id, classname, tagname) {
            this.user = user;
            this.id = id;
            this.classname = classname;
            this.tagname = tagname;
        }

//добавить метод для апперкейса первой буквы
        createCard(pictureSize) {
            const card = document.createElement(this.tagname);
            card.classList.add(this.classname);
            card.dataset.id = this.id;
            const img = document.createElement(`img`);
            img.src = this.user[`picture`][pictureSize];
            img.alt = `photo of ${this.user[`gender`] === `male` ? `men` : `women`}`;
            card.append(img);
            const fullName = document.createElement(`p`);
            fullName.textContent = `${this.user[`name`][`title`]} ${this.user[`name`][`first`]} ${this.user[`name`][`last`]}`;
            card.append(fullName);
            return card;
        }

        createBtn(text, btnClass) {
            const modalBtn = document.createElement(`div`);
            modalBtn.textContent = text;
            modalBtn.classList.add(btnClass);
            return modalBtn;
        }
    }

    class UserCard extends UserCardPreview {
        createInfoRow(key, value) {
            const row = document.createElement(`span`);
            row.textContent = `${key}: ${value}`;
            return row;
        }

        createCard(pictureSize) {
            const card = super.createCard(pictureSize);
            const info = document.createElement(`div`);
            for (let key in this.user) {
                if (key !== `name` && key !== `picture`) {
                    info.append(this.createInfoRow(key, this.user[key]));
                }
            }
            card.append(info);
            return card;
        }
    }

});


//модальное окно для каждого пользователя

//сортировка и поиск
