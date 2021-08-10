`use strict`;

let newArr = [];
const req = new Request(`https://api.randomuser.me/1.0/?results=50&nat=gb,us&inc=gender,name,location,email,phone,picture`)
/*const getData = async () => {
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
};*/
const getUserList = (callback) => {
    fetch(req)
        .then(response => response.json())
        .then(data => callback(data.results))
        .catch(err => console.log(err));
}

document.addEventListener(`DOMContentLoaded`, () => {

    const sortAToZBtn = document.querySelector(`.sort-up`);
    const sortZToABtn = document.querySelector(`.sort-down`);
    const cardOverlay = document.querySelector(`.modal-overlay`);
    const searchInput = document.querySelector(`.search`);
    const searchBtn = document.querySelector(`.search-btn`);
    const cancelBtn = document.querySelector(`.cancel-btn`);
    const userList = document.querySelector(`.users__list`);
    const cardFullInfoElement = document.querySelector(`.card_full-info`);

    const addUserCard = (dataArr) => {
        newArr = dataArr.map((user, id) => {
            return new UserCardPreview(user, id, `card`, `li`);
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
            const card = user.createCard(`medium`, `card__wrapper_left`);
            card.append(user.createBtn(`..show more info`, `modal-open`));
            userList.append(card);
        })
        //открытие модального окна
        userList.addEventListener(`click`, (e) => {
            const target = e.target;
            if (target.classList.contains(`modal-open`)) {

                const id = target.closest(`.card`).dataset.id;
                const user = newArr[id].user;
                //это все в отдельную функцию createModalCardElement() и createBtn() добавь
                const cardFullInfo = new UserCard(user, id, `card_full-info`, `div`);
                const fullCard = cardFullInfo.createCard(`large`, `card__wrapper_column`);
                const closeModalBtn = cardFullInfo.createBtn(`Close user card`, `modal-open`);
                fullCard.append(closeModalBtn);
                cardFullInfoElement.innerHTML = ``;
                openModalCard();
                //селекторы потом менять будешь
                cardFullInfoElement.append(fullCard);
                //закрытие модального окна
                cardOverlay.addEventListener(`click`, (event) => {
                    if (event.target === cardOverlay) {
                        closeModalCard();
                    }
                });
                cardOverlay.addEventListener(`click`, (event) => {
                    if (event.target === closeModalBtn) {
                        closeModalCard();
                    }
                });
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

    function enableScroll() {
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
            if (newArr.length > 0) {
                renderList();
            } else {
                userList.textContent = `No Results`;
            }

        })
    })
    cancelBtn.addEventListener(`click`, () => {
        newArr = [];
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
        uppercaseFirstLetter(word){
            if(word.length > 1){
                return `${word[0].toUpperCase()}${word.substring(1)}`;
            } else return word;
        }

        getFullName() {
            const name = this.user[`name`];
            const fullName = [];
            for (let key in name) {
                fullName.push(this.uppercaseFirstLetter(name[key]));
            }
            fullName[0]!==`Miss` ? fullName[0] = `${fullName[0]}.`: fullName[0];
            return fullName.join(` `);
        }

        createCard(pictureSize, wrapperClass) {
            const card = document.createElement(this.tagname);
            card.classList.add(this.classname);
            card.dataset.id = this.id;
            const div = document.createElement(`div`);
            div.classList.add(wrapperClass);
            const img = document.createElement(`img`);
            img.src = this.user[`picture`][pictureSize];
            img.alt = `photo of this ${this.user[`gender`] === `male` ? `man` : `lady`}`;
            div.append(img);
            const fullName = document.createElement(`p`);
            fullName.textContent = `${this.getFullName()}`;
            div.append(fullName);
            card.append(div);
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
            const row = document.createElement(`p`);
            row.textContent = `${this.uppercaseFirstLetter(key)}: ${this.uppercaseFirstLetter(value)}`;
            return row;
        }

        createCard(pictureSize, wrapperClass) {
            const card = super.createCard(pictureSize, wrapperClass);
            const info = document.createElement(`div`);
            for (let key in this.user) {
                if (key !== `name` && key !== `picture`&& key !== `location`) {
                    info.append(this.createInfoRow(key, this.user[key]));
                }
                if (key === `location`){
                    for(let i in this.user[`location`]){
                        info.append(this.createInfoRow(i, this.user[`location`][i]));
                    }
                }
            }
            card.append(info);
            return card;
        }
    }

});


//модальное окно для каждого пользователя

//сортировка и поиск
