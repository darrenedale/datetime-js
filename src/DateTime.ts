import {TimeZone} from "./TimeZone.js";
import {DateTimeError} from "./DateTimeError.js";
import {DateTimeFormatter} from "./DateTimeFormatter.js";

/** Enumeration of options for the weekday component of a DateTime. */
export enum Weekday
{
    Sunday= 0,
    Monday,
    Tuesday,
    Wednesay,
    Thursday,
    Friday,
    Saturday,
}

/** Interface for DateTime instances. */
export interface DateTimeInterface
{
    readonly timestamp: number;
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly ms: number;
    readonly weekday: Weekday;
    readonly timeZone: TimeZone;
}


/**
 * Representation of a date and time, accurate to the millisecond, for a given timezone.
 *
 * Instances are immutable and guaranteed to be valid - you can't create an invalid DateTime.
 */
export class DateTime implements DateTimeInterface
{
    /** Unix timestamp in ms. */
    private readonly m_timestamp: number;

    /** Year in the given timezone. */
    private readonly m_year: number;

    /** Month in the given timezone. */
    private readonly m_month: number;

    /** Day in the given timezone. */
    private readonly m_day: number;

    /** Day of the week in the given timezone. */
    private readonly m_weekday: Weekday;

    /** Hour in the given timezone. */
    private readonly m_hour: number;

    /** Minute in the given timezone. */
    private readonly m_minute: number;

    /** Second in the given timezone. */
    private readonly m_second: number;

    /** Millisecond in the given timezone. */
    private readonly m_ms: number;

    /** The timezone. */
    private readonly m_timezone: TimeZone;

    private m_formatter?: DateTimeFormatter;

    /**
     * Initialise a new DateTime with an ECMA timestamp and a timezone.
     *
     * This constructor is for internal use - use one of the static factory methods to create new instances.
     *
     * @param timestamp The ECMA timestamp (ms since 1970-01-01T00:00:00.000UTC)
     * @param timeZone The TimeZone for the DateTime. Default is UTC.
     */
    private constructor(timestamp: number, timeZone: TimeZone = TimeZone.utc)
    {
        this.m_timestamp = timestamp;
        this.m_timezone = timeZone;

        // add the offset to the UTC timestamp
        const date = new Date(timestamp + (timeZone.offset * 60 * 1000));

        // read the fields at the offset
        this.m_year = date.getUTCFullYear();
        this.m_month = date.getUTCMonth() + 1;
        this.m_day = date.getUTCDate();
        this.m_weekday = date.getUTCDay();
        this.m_hour = date.getUTCHours();
        this.m_minute = date.getUTCMinutes();
        this.m_second = date.getUTCSeconds();
        this.m_ms = date.getUTCMilliseconds();
    }

    /** The ECMA timestamp of the DateTime. */
    public get timestamp(): number
    {
        return this.m_timestamp;
    }

    /** The year of the DateTime. */
    public get year(): number
    {
        return this.m_year;
    }

    /** Clone the DateTime, but with a different year. */
    public withYear(year: number): DateTime
    {
        return DateTime.fromDateTime(year, this.month, this.day, this.hour, this.minute, this.second, this.ms, this.timeZone);
    }

    /** The month of the DateTime (1 = January, 12 = December). */
    public get month(): number
    {
        return this.m_month;
    }

    /** Clone the DateTime, but with a different month. */
    public withMonth(month: number): DateTime
    {
        return DateTime.fromDateTime(this.year, month, this.day, this.hour, this.minute, this.second, this.ms, this.timeZone);
    }

    /** The day of the DateTime. */
    public get day(): number
    {
        return this.m_day;
    }

    /** The day of the week for the DateTime. */
    public get weekday(): Weekday
    {
        return this.m_weekday;
    }

    /** Clone the DateTime, but with a different day. */
    public withDay(day: number): DateTime
    {
        return DateTime.fromDateTime(this.year, this.month, day, this.hour, this.minute, this.second, this.ms, this.timeZone);
    }

    /** Clone the DateTime, but with a different date. */
    public withDate(year: number, month: number, day: number): DateTime
    {
        return DateTime.fromDateTime(year, month, day, this.hour, this.minute, this.second, this.ms, this.timeZone);
    }

    /** The day of the DateTime (0..23). */
    public get hour(): number
    {
        return this.m_hour;
    }

    /** Clone the DateTime, but with a different hour. */
    public withHour(hour: number): DateTime
    {
        return DateTime.fromDateTime(this.year, this.month, this.day, hour, this.minute, this.second, this.ms, this.timeZone);
    }

    /** The minute of the DateTime (0..59). */
    public get minute(): number
    {
        return this.m_minute;
    }

    /** Clone the DateTime, but with a different minute. */
    public withMinute(minute: number): DateTime
    {
        return DateTime.fromDateTime(this.year, this.month, this.day, this.hour, minute, this.second, this.ms, this.timeZone);
    }

    /** The second of the DateTime (0..59). */
    public get second(): number
    {
        return this.m_second;
    }

    /** Clone the DateTime, but with a different second. */
    public withSecond(second: number): DateTime
    {
        return DateTime.fromDateTime(this.year, this.month, this.day, this.hour, this.minute, second, this.ms, this.timeZone);
    }

    /** The millisecond of the DateTime (0..999). */
    public get ms(): number
    {
        return this.m_ms;
    }

    /** Clone the DateTime, but with a different millisecond. */
    public withMs(ms: number): DateTime
    {
        return DateTime.fromDateTime(this.year, this.month, this.day, this.hour, this.minute, this.second, ms, this.timeZone);
    }

    /** Clone the DateTime, but with a different time. */
    public withTime(hour: number, minute: number, second: number = undefined, ms: number = undefined): DateTime
    {
        return DateTime.fromDateTime(this.year, this.month, this.day, hour, minute, second ?? this.second, ms ?? this.ms, this.timeZone);
    }

    /** The TimeZone of the DateTime. */
    public get timeZone(): TimeZone
    {
        return this.m_timezone;
    }

    /** Clone the DateTime, but with a different TimeZone. */
    public withTimeZone(timeZone: TimeZone): DateTime
    {
        return new DateTime(this.timestamp, timeZone);
    }

    /** Clone the DateTime, but with a different timestamp. */
    public withTimestamp(timestamp: number): DateTime
    {
        return new DateTime(timestamp, this.timeZone);
    }

    /** Get the formatter for the DateTime. */
    protected get formatter(): DateTimeFormatter
    {
        if (undefined === this.m_formatter) {
            this.m_formatter = new DateTimeFormatter();
        }

        return this.m_formatter;
    }

    /**
     * Generate an ISO8601 date-time string for the DateTime.
     *
     * This provides some compatibility with JavaScript Date objects.
     */
    public toISOString(): string
    {
        this.formatter.formatString = DateTimeFormatter.formatStringIso8601;
        return this.formatter.format(this);
    }

    /**
     * Helper to validate a year for a DateTime object.
     *
     * @return `true` if the year is valid, `false` if not.
     */
    private static isValidYear(year: number): boolean
    {
        return 0 <= year;
    }

    /**
     * Helper to validate a month for a DateTime object.
     *
     * @return `true` if the month is valid, `false` if not.
     */
    private static isValidMonth(month: number): boolean
    {
        return 1 <= month && 12 >= month;
    }

    /**
     * Helper to validate a day for a DateTime object.
     *
     * The validation accounts for the month it's being used with, and whether the year it's being used with is a leap
     * year. It doesn't (yet) validate against the transition to the Gregorian calendar.
     *
     * @return `true` if the day is valid, `false` if not.
     */
    private static isValidDay(day: number, month: number, year: number): boolean
    {
        let max: number;

        switch (month) {
            case 2:
                // - leap year every 4 years
                // - except every 100 years when it's not
                // - except every 400 years when it is again
                if (0 === year % 4 && (0 !== year % 100 || 0 === year % 400)) {
                    max = 29;
                } else {
                    max = 28;
                }
                break;

            case 9:
            case 4:
            case 6:
            case 11:
                max = 30;
                break;

            default:
                max = 31;
        }

        return 1 <= day && max >= day;
    }

    /**
     * Helper to validate an hour for a DateTime object.
     *
     * @return `true` if the hour is valid, `false` if not.
     */
    private static isValidHour(hour: number): boolean
    {
        return 0 <= hour && 23 >= hour;
    }

    /**
     * Helper to validate a minute for a DateTime object.
     *
     * @return `true` if the minute is valid, `false` if not.
     */
    private static isValidMinute(minute: number): boolean
    {
        return 0 <= minute && 59 >= minute;
    }

    /**
     * Helper to validate a second for a DateTime object.
     *
     * @return `true` if the second is valid, `false` if not.
     */
    private static isValidSecond(second: number): boolean
    {
        return 0 <= second && 59 >= second;
    }

    /**
     * Helper to validate a millisecond for a DateTime object.
     *
     * @param ms The millisecond to validate.
     *
     * @return `true` if the millisecond is valid, `false` if not.
     */
    private static isValidMs(ms: number): boolean
    {
        return 0 <= ms && 999 >= ms;
    }

    /**
     * Create a new DateTime instance from an ECMA timestamp.
     *
     * @param timestamp The ECMA timestamp to use to create the DateTime.
     * @param timeZone The TimeZone for the new DateTime. Defaults to UTC.
     *
     * @return The created DateTime instance.
     */
    public static fromTimestamp(timestamp: number, timeZone: TimeZone = TimeZone.utc): DateTime
    {
        return new DateTime(timestamp, timeZone);
    }

    /**
     * Create a new DateTime instance.
     *
     * This method throws if any of the date-time components is not valid. Months are from 1 (January) to 12 (December),
     * unlike built-in JS Date objects which measure months from 0 (January) to 11 (December). The day must be valid for
     * the month and year.
     *
     * @param year The year to use to create the DateTime.
     * @param month The month to use to create the DateTime.
     * @param day The day to use to create the DateTime.
     * @param hour The hour to use to create the DateTime.
     * @param minute The minute to use to create the DateTime.
     * @param second The second to use to create the DateTime.
     * @param ms The millisecond to use to create the DateTime.
     * @param timeZone The TimeZone for the new DateTime. Defaults to UTC.
     *
     * @return The created DateTime instance.
     * @throws DateTimeError if the requested date and/or time is not valid.
     */
    public static fromDateTime(year: number, month: number, day: number, hour: number, minute: number, second: number, ms: number = 0, timeZone: TimeZone = TimeZone.utc): DateTime
    {
        if (!DateTime.isValidYear(year)) {
            throw new DateTimeError(`Expected valid year, found ${year}.`);
        }

        if (!DateTime.isValidMonth(month)) {
            throw new DateTimeError(`Expected valid month, found ${month}.`);
        }

        if (!DateTime.isValidDay(day, month, year)) {
            throw new DateTimeError(`Expected valid day, found ${day}.`);
        }

        if (!DateTime.isValidHour(hour)) {
            throw new DateTimeError(`Expected valid hour, found ${hour}.`);
        }

        if (!DateTime.isValidMinute(minute)) {
            throw new DateTimeError(`Expected valid minute, found ${minute}.`);
        }

        if (!DateTime.isValidSecond(second)) {
            throw new DateTimeError(`Expected valid second, found ${second}.`);
        }

        if (!DateTime.isValidMs(ms)) {
            throw new DateTimeError(`Expected valid ms, found ${ms}.`);
        }

        const date = new Date();
        date.setUTCFullYear(year, month - 1, day);
        date.setUTCHours(hour, minute, second, ms);
        return new DateTime(date.getTime() - (timeZone.offset * 60 * 1000), timeZone);
    }

    /**
     * Create a DateTime object for the current time in a given TimeZone.
     *
     * @param timeZone The TimeZone for the DateTime object. Defaults to UTC.
     *
     * @return The created DateTime instance.
     */
    public static now(timeZone: TimeZone = TimeZone.utc): DateTime
    {
        return new DateTime(Date.now(), timeZone);
    }

    /**
     * Parse an ISO8601 date-time string to a DateTime object.
     *
     * @param dateTime The date-time string to parse.
     *
     * @throws DateTimeError if the string is ill-formed or contains an invalid date-time.
     */
    public static parse(dateTime: string): DateTime
    {
        const result = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?([+-]?\d{2}:?\d{2})$/.exec(dateTime);

        if (null === result) {
            throw new DateTimeError(`Expected valid ISO8601 date-time, found "${dateTime}".`);
        }

        return DateTime.fromDateTime(
            Number.parseInt(result[1]),
            Number.parseInt(result[2]),
            Number.parseInt(result[3]),
            Number.parseInt(result[4]),
            Number.parseInt(result[5]),
            Number.parseInt(result[6]),
            (undefined === result[7] ? 0 : Number.parseInt(result[7])),
            new TimeZone(result[8])
        );
    }
}
