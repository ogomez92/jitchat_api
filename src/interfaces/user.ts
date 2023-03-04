import Language from '../enums/language';
import UserStatus from '../enums/user_status';

export default interface User {
    id: string;
    username: string;
    intro: string;
    status?: UserStatus;
  }
  