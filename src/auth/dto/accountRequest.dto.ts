import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAccountRequest {
    @IsNotEmpty({
        message: "Email khöng được để trống"
    })
    @IsEmail({}, {
        message: "Email không hợp lệ"
    })
    email: string;

    @IsNotEmpty({
        message: "Mật khẩu không được để trống"
    })
    @MinLength(8, {
        message: "Mật khẩu phải ít nhất 8 ky tự"
    })
    password: string;
}
