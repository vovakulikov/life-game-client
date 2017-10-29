'use strict';

//
// YOUR CODE GOES HERE...


/**
 * Функция коллбек на ввода имени комнаты (привязка котроллера)
 * 
 * @param {string} token - токен комнаты игры
 */
App.onToken = (token) =>  new AppLogic(LifeGame, new Socket(token));


/**
 * Класс Контроллера - бизнес логики приложения.
 */
class AppLogic {

    /**
     * Конструктор класса
     * 
     * Здесь мы прокидываем ссылку на класс игры, так как не можем
     * создать инстанс игры сразу. Нам нужно дождаться ответа от сервера 
     * с данными для создания инстанса класса.
     * 
     * @param {*} Life -- ссылка на класс игры
     * @param {*} Socket  - инстанс класса сокета
     */
    constructor(Life, socket) {
        this.lifeLink = Life;
        this.socket = socket;
        this.game = null;

        this.subscribeOnSocketMessage(socket);
    }

    /**
     * Функция для получения инстанса игры.
     * 
     * @param {*} user - данные о пользователе
     * @param {*} settings - данные о поле игры
     */
    getInstanceGame(user, settings) {
        const Life = this.lifeLink;

        return new Life(user, settings);
    }

    /**
     * Подписка на сообщения от сервера
     * 
     * @param {*} socket - инстанс класса сокета
     */
    subscribeOnSocketMessage(socket) {
        socket.on('message', (res) => {
            const action = JSON.parse(res.data);
            
            console.log(res)
            this.pickStrategy(action);
        });
    }

    /**
     * Выбор стратегии в зависимости от типа сообщения от сервера
     * 
     * @param {*} param0 
     */
    pickStrategy({type, data}) {
        const strategy = {
            INITIALIZE: (initData) => this.initGame(initData),
            UPDATE_STATE: (newState) => this.updateGameState(newState)
        }
        
        if (strategy.hasOwnProperty(type)) { strategy[type](data); }
    }

    /**
     * Метод инициализации игры
     * Создаем инстанс, переопределяем метод send
     * инициализируем, обновлеем sate игры
     * 
     * @param {*} Life - ссылка на класс 
     * @param {*} param1 - данные для создания класса игры
     */
    initGame({user, settings, state}) {
        this.game = this.getInstanceGame(user, settings);
        this.game.send = this.sendPoint.bind(this);

        this.game.init();
        this.updateGameState(state)
    }

    updateGameState(state) {
        this.game.setState(state);
    }

    sendPoint(data) {
        this.socket.send(JSON.stringify({ type: 'ADD_POINT', data}));
    }
} 


class Socket {
    constructor(handshakeToken) {
        const url = `ws://localhost:3000/?token=${handshakeToken}`;
        this.socket = new WebSocket(url);

        this.addCommonHandler();
    }

    addCommonHandler () {
        this.on('open', (ctx) => console.log('open event', ctx))
        this.on('error', (ctx) => console.log('error event', ctx))
        this.on('close', (ctx) => console.log('open close', ctx))
    }
    on(typeEvent, callback) {
        this.socket.addEventListener(typeEvent, callback);
    }

    send(data) {
        this.socket.send(data);
    }
}

//
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░░░
// ░░░░░░░░▄▀░░░░░░░░░░░░▄░░░░░░░▀▄░░░░░░░░
// ░░░░░░░░█░░▄░░░░▄░░░░░░░░░░░░░░█░░░░░░░░
// ░░░░░░░░█░░░░░░░░░░░░▄█▄▄░░▄░░░█░▄▄▄░░░░
// ░▄▄▄▄▄░░█░░░░░░▀░░░░▀█░░▀▄░░░░░█▀▀░██░░░
// ░██▄▀██▄█░░░▄░░░░░░░██░░░░▀▀▀▀▀░░░░██░░░
// ░░▀██▄▀██░░░░░░░░▀░██▀░░░░░░░░░░░░░▀██░░
// ░░░░▀████░▀░░░░▄░░░██░░░▄█░░░░▄░▄█░░██░░
// ░░░░░░░▀█░░░░▄░░░░░██░░░░▄░░░▄░░▄░░░██░░
// ░░░░░░░▄█▄░░░░░░░░░░░▀▄░░▀▀▀▀▀▀▀▀░░▄▀░░░
// ░░░░░░█▀▀█████████▀▀▀▀████████████▀░░░░░░
// ░░░░░░████▀░░███▀░░░░░░▀███░░▀██▀░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
//
// Nyan cat lies here...
//