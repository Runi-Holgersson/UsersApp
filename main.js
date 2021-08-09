`use strict`;

let newArr = [];
let filteredArr = [];
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

    const sortAToZBtn = document.querySelector(`.sort-up`);
    const sortZToABtn = document.querySelector(`.sort-down`);
    const cardOverlay = document.querySelector(`.modal-overlay`);
    const searchInput = document.querySelector(`.search`);
    const searchBtn = document.querySelector(`.search-btn`);
    const cancelBtn = document.querySelector(`.cancel-btn`);
    const userList = document.querySelector(`.users__list`);

    const addUserCard = (dataArr) => {
        newArr = dataArr.map((user, id) => {
            return user = new UserCardPreview(user, id, `card`, `li`);
        });
        return newArr;
    }
    //рендер списка при загрузке страницы, при селекте и при сортировке
    const renderList = (dataArr) => {
        //добавь условие
        if (newArr.length === 0) {
            addUserCard(dataArr);
        }
        userList.innerHTML = ``;
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
                //это все в отдельную функцию createModalCardElement() и createBtn() добавь
                const cardFullInfo = new UserCard(user, id, `card_full-info`, `div`);
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
        disableScroll();
    }

    function closeModalCard() {
        cardOverlay.classList.remove(`modal-overlay_open`);
        enableScroll();
    }
    function disableScroll() {
        const scrollWidth = window.innerWidth - document.body.offsetWidth;
        document.body.style.cssText = `
    overflow: hidden;
    padding-right: ${scrollWidth}px;
    `;
    }
    function enableScroll()  {
        document.body.style.cssText = ``;
    }
    //функции сортировки
    function sortAToZ(arr) {
        arr.sort((a, b) => {
            let lastNameA = a.user.name[`last`].toLowerCase(), lastNameB = b.user.name[`last`].toLowerCase();
            if (lastNameA < lastNameB) {
                return -1;
            }
            if (lastNameA > lastNameB) {
                return 1;
            }
            return 0;
        });
        arr.forEach((user, id) => user.id = id);
        return arr;
    }

    function sortZToA(arr) {
        sortAToZ(arr).reverse();
        arr.forEach((user, id) => user.id = id);
        return arr;
    }


    //функция селект
    function selectUsers(arr, value) {
        newArr = arr.filter(item => {
            let fullName = `${item.user.name[`first`].toLowerCase()} ${item.user.name[`last`].toLowerCase()}`;
            return (fullName.indexOf(value.toLowerCase(), 0) !== -1);
        });
        return newArr.forEach((user, id) => user.id = id);
    }

//при загрузке страницы, получаем данные, навешиваем юзерам классы и сохраняем в новый массив
    getUserList(renderList);
    sortAToZBtn.addEventListener(`click`, () => {
        sortAToZ(newArr);
        renderList();
    });
    sortZToABtn.addEventListener(`click`, () => {
        sortZToA(newArr);
        renderList();
    });
    searchInput.addEventListener(`change`, (e) => {
        const value = e.target.value;
        searchBtn.addEventListener(`click`, () => {
            selectUsers(newArr, value);
            if (newArr.length > 0){
                renderList();
            } else {
                userList.textContent = `No Results`;
            }

        })
    })
    cancelBtn.addEventListener(`click`, () => {
        newArr =[];
        searchInput.value = ``;
        getUserList(renderList);
    })


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
            img.alt = `photo of this ${this.user[`gender`] === `male` ? `men` : `women`}`;
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
