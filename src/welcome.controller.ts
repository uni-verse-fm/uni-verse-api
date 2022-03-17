import { Controller, Get } from '@nestjs/common';

@Controller()
export class WelcomeController {
    @Get()
    welcome() {
        return "Welcome to our universe 🪐 where your music is our dark matter.";
    }
}
