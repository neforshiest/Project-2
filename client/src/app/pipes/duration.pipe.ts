import {Pipe, PipeTransform} from '@angular/core';
import { padNumber } from '@ng-bootstrap/ng-bootstrap/util/util';
import * as moment from 'moment';

@Pipe({
    name: 'duration',
    standalone: true,
    pure: false
})
export class DurationPipe implements PipeTransform {
    transform(value: number): string {
        const duration = moment.duration(value || 0, 'second');
        return `${this.padLeft(duration.hours())}:${this.padLeft(duration.minutes())}:${this.padLeft(duration.seconds())}`;
    }

    private padLeft(value: number): string {
        let str = value.toString();

        while (2 > str.length) {
            str = '0' + str;
        }

        return str;
    }
}