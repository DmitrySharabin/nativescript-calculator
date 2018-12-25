import { Component, OnInit } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { device } from "platform";
import * as dialogs from "tns-core-modules/ui/dialogs";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "home.component.html",
    styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {
    // Содержимое поля ввода.
    inputField: string = '0';

    // Код выбранной операции:
    // 1 — умножение,
    // 2 — деление,
    // 3 — сложение,
    // 4 — вычитание.
    operationCode: number;

    // Признак ввода второго аргумента.
    isSecondArgStarts: boolean = false;

    // Первый аргумент.
    firstArg: number;

    // Второй аргумент.
    secondArg: number;

    // Признак произведённого вычисления.
    isEvaluated: boolean = false;

    // Признак ошибки — нужно заблокировать кнопки.
    isError: boolean = false;

    // Признак того, что в качестве символа разделителя целой и дробной
    // частей числа является запятая.
    isDecimalComma: boolean;

    constructor(private translateService: TranslateService) {
        let language: string;

        translateService.addLangs(['ru', 'en', 'fr']);
        translateService.setDefaultLang('en');
        translateService.use(device.language.slice(0, 2));
        language = device.language.slice(0, 2);
        this.isDecimalComma = language === 'ru' || language === 'fr';
    }

    ngOnInit(): void {
    }

    clear(): void {
        // Очищаем поле ввода.
        this.inputField = '0';

        // Нет ошибок.
        this.isError = false;

        // Не начинается ввод второго аргумента.
        this.isSecondArgStarts = false;

        // Сбрасываем признак проведённых вычислений.
        this.isEvaluated = false;
    }

    // Удаляем последнюю цифру из поля ввода.
    backspace(): void {
        // Сбрасываем признак проведённых вычислений.
        this.isEvaluated = false;
        // Удаление единственной цифры (с возможным знаком минус перед ней) равносильно очистке поля ввода.
        if (this.inputField.length === 1 || (this.inputField.length === 2 && this.inputField[0] === '-')) {
            this.inputField = '0';
            return;
        }
        // Удаляем последний символ.
        this.inputField = this.inputField.slice(0, -1);
        // Если перед удаляемой цифрой идёт десятичная точка, удаляем и её.
        if (this.inputField.slice(-1) === ',' || this.inputField.slice(-1) === '.') {
            this.inputField = this.inputField.slice(0, -1);
        }
        // Число -0 заменяем на 0.
        if (this.inputField === '-0') {
            this.inputField = '0';
        }
    }

    // Формируем вводимое число.
    inputDigit(num: number): void {
        // Если ввод числа осуществляется после нажатия клавиши равно.
        if (this.isEvaluated) {
            // Сбрасываем признак.
            this.isEvaluated = false;
            // И выводим цифру, соответствующую нажатой кнопке.
            this.inputField = num.toString();
            return;
        }
        // Если вводится первая цифра второго аргумента,
        // она должна заменить собой содержимое поля ввода.
        if (this.isSecondArgStarts) {
            // Первая цифра второго аргумента введена. Сбрасываем соответствующий признак.
            this.isSecondArgStarts = false;
            this.inputField = num.toString();
            return;
        }
        if (this.inputField === '0' && num === 0) {
            return; // Число нуль состоит из одного нуля. У чисел не может быть ведущих нулей.
        } else if (this.inputField === '0') {
            this.inputField = num.toString(); // Одиночный нуль заменяем на введённую цифру.
            return;
        }
        this.inputField = this.inputField + num;
    }

    // Добавляем десятичную точку.
    addDot(): void {
        // Если в числе уже есть десятичная точка, новую не добавляем.
        if (this.inputField.indexOf(',') !== -1 || this.inputField.indexOf('.') !== -1) {
            return;
        }
        // Иначе, добавляем её.
        if (this.isDecimalComma) {
            this.inputField = this.inputField + ',';
        } else {
            this.inputField = this.inputField + '.';
        }
        // Если добавляем в число десятичную точку, сбрасываем признак проведённых вычислений.
        // Это позволит использовать полученный ответ в качестве первого аргумента.
        this.isEvaluated = false;
    }

    // Меняем знак числа на противоположный.
    changeSign(): void {
        // У нуля нельзя менять знак.
        if (this.inputField === '0' || this.inputField === '0,' || this.inputField === '0.') {
            return;
        }
        // Если у числа уже есть минус, удаляем его.
        if (this.inputField[0] === '-') {
            this.inputField = this.inputField.slice(1);
        } else {
            // Иначе, добавляем его к числу.
            this.inputField = '-' + this.inputField;
        }
        // Если меняем знак числа, сбрасываем признак проведённых вычислений.
        // Это позволит использовать полученный ответ в качестве первого аргумента.
        this.isEvaluated = false;
    }

    // Устанавливаем операцию, которую нужно выполнить над числами.
    setOperationByCode(code: number): void {
        // Сбрасываем признак проведённых вычислений.
        this.isEvaluated = false;
        // Запоминаем операцию по её коду.
        this.operationCode = code;
        // Преобразуем привычную нам десятичную запись числа
        // в вид, понятный компьютеру.
        if (this.isDecimalComma) {
            this.firstArg = parseFloat(this.inputField.replace(',', '.'));
        } else {
            this.firstArg = parseFloat(this.inputField);
        }
        // Устанавливаем признак, что начинается ввод второго аргумента.
        this.isSecondArgStarts = true;
    }

    // Вычисляем результат.
    evaluate(): void {
        // Отмечаем, что вычисления проведены.
        this.isEvaluated = true;
        // Преобразуем привычную нам десятичную запись числа
        // в вид, понятный компьютеру.
        if (this.isDecimalComma) {
            this.secondArg = parseFloat(this.inputField.replace(',', '.'));
        } else {
            this.secondArg = parseFloat(this.inputField);
        }
        // Выполняем над введёнными числами выбранную операцию.
        // Результат перед выводом на экран преобразуется из вида, понятного компьютеру,
        // в вид, понятный человеку: в качестве разделителя целой и дробной частей
        // в России используется запятая.
        switch (this.operationCode) {
            case 1:
                if (this.isDecimalComma) {
                    this.inputField = (this.firstArg * this.secondArg).toString().replace('.', ',');
                } else {
                    this.inputField = (this.firstArg * this.secondArg).toString();
                }
                break;
            case 2:
                if (this.secondArg === 0) {
                    // Если выбрана операция деления и второй аргумент равен нулю,
                    // то выводим сообщение об ошибке.
                    this.translateService
                        .get('ERROR_MESSAGE')
                        .subscribe(translation => this.inputField = translation);
                    // И отключаем все кнопки, кроме кнопки очистки поля ввода.
                    this.isError = true;
                    return;
                }
                if (this.isDecimalComma) {
                    this.inputField = (this.firstArg / this.secondArg).toString().replace('.', ',');
                } else {
                    this.inputField = (this.firstArg / this.secondArg).toString();
                }
                break;
            case 3:
                if (this.isDecimalComma) {
                    this.inputField = (this.firstArg + this.secondArg).toString().replace('.', ',');
                } else {
                    this.inputField = (this.firstArg + this.secondArg).toString();
                }
                break;
            case 4:
                if (this.isDecimalComma) {
                    this.inputField = (this.firstArg - this.secondArg).toString().replace('.', ',');
                } else {
                    this.inputField = (this.firstArg - this.secondArg).toString();
                }
        }
    }

    // Изменяем язык приложения.
    changeLanguage(): void {
        const chooseLanguageDialogOptions = {
            title: "",
            message: "",
            cancelButtonText: "",
            actions: ["Русский", "English", "Français"]
        };
        // Переведём элементы диалогового окна на текущий язык.
        this.translateService
            .get('DIALOG_TITLE')
            .subscribe(translation => chooseLanguageDialogOptions.title = translation);
        this.translateService
            .get('DIALOG_MESSAGE')
            .subscribe(translation => chooseLanguageDialogOptions.message = translation);
        this.translateService
            .get('DIALOG_CANCEL_BUTTON_TEXT')
            .subscribe(translation => chooseLanguageDialogOptions.cancelButtonText = translation);

        // Отобразим пользователю диалоговое окно и установим язык приложения в соответствии с выбором пользователя.
        dialogs.action(chooseLanguageDialogOptions).then((result) => {
            switch (result) {
                case 'Русский':
                    this.translateService.use('ru');
                    this.isDecimalComma = true;
                    break;
                case 'English':
                    this.translateService.use('en');
                    this.isDecimalComma = false;
                    break;
                case 'Français':
                    this.translateService.use('fr');
                    this.isDecimalComma = true;
                    break;
                default:
                    return;
            }
            this.clear();
        });
    }
}
