// logger.js

const { createLogger, transports } = require('winston');
const nodemailer = require('nodemailer');

// Создание транспортера для отправки почты
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true, // используется SSL
    auth: {
      user: 'wertus1945@mail.ru', // ваш адрес электронной почты на mail.ru
      pass: 'dngSbt6q9rCtNv6iZvCN', // ваш пароль от почты
    },
});

// Создание логгера с использованием winston
const logger = createLogger({
    transports: [
        new transports.Console(), // Логирование в консоль
        new transports.File({ filename: 'error.log', level: 'error' }) // Логирование в файл error.log
    ]
});

// Экспорт логгера
module.exports = logger;

// Функция для отправки email
function sendEmail(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Отправить письмо с сообщением об успешной регистрации
function sendSuccessEmail() {
    const successMailOptions = {
        from: 'wertus1945@mail.ru',
        to: 'wertus1945@mail.ru',
        subject: 'Успешная регистрация',
        text: 'Поздравляем! Регистрация прошла успешно.'
    };
    sendEmail(successMailOptions);
}

// Отправить письмо с сообщением об ошибке регистрации
function sendErrorEmail() {
    const errorMailOptions = {
        from: 'wertus1945@mail.ru',
        to: 'wertus1945@mail.ru',
        subject: 'Ошибка при регистрации',
        text: 'Произошла ошибка при регистрации пользователя. Пожалуйста, проверьте журналы для получения дополнительной информации.'
    };
    sendEmail(errorMailOptions);
}

// Вызов функций для отправки email
sendSuccessEmail();
sendErrorEmail();
module.exports = logger;