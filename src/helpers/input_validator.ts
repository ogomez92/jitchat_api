export default class InputValidator {
    public static isNameValid = (text: string) => text.length >= 5 && text.length <= 50 && !text.includes('http');
    
    public static isIntroValid = (text: string) => text.length >= 50 && text.length <= 1000 && !text.includes('http');
    }
    