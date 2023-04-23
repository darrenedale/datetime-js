import {DateTimeInterface, Weekday} from "./DateTime.js";
import {DateTimeFormatterError} from "./DateTimeFormatterError.js";

type ComponentFormatter = (dateTime: DateTimeInterface, args: string) => string;

type ComponentFormatterMap = {
    [specifier: string]: ComponentFormatter;
};

interface DateTimeFormatterInterface
{
    formatString: string;

    format(dateTime: DateTimeInterface): string;
}

/**
 * Format DateTime instances as strings, according to a format.
 *
 * The format can contain placeholders for components from the DateTime. A bunch of commonly-used components is
 * provided, but you can extend the supported formats by providing your own component formatters.
 *
 * Placeholders in the format string are enclosed in {braces}. Any text not enclosed in {braces} is treated as literal
 * text which is output to the formatted date-time string verbatim. If you need a literal { in your formatted date-time
 * string, use the placeholder {{}. Some placeholders accept arguments. In these cases, place the arguments after the
 * placeholder, separated by a colon - for example, {year:4}. The arguments are provided to the component formatter as a
 * single string - the component formatter is responsible for interpreting the arguments string.
 *
 * The following placeholders are defined internally:
 * - Y 4-digit year, left-padded with 0s if required
 * - y 2-digit year, left-padded with 0s if required
 * - year:n n-digit year, left-padded with 0s if required. n is a minimum (more digits will be used if required), and
 *   defaults to 4
 * - M 2-digit month, left-padded with 0 if required
 * - month:n n-digit month, left-padded with 0s if required. n is a minimum (more digits will be used if required), and
 *   defaults to 1
 * - D 2-digit day, left-padded with 0 if required
 * - day:n n-digit day, left-padded with 0s if required. n is a minimum (more digits will be used if required), and
 *   defaults to 1
 * - h 2-digit hour, left-padded with 0 if required
 * - hour:n n-digit hour, left-padded with 0s if required. n is a minimum (more digits will be used if required), and
 *   defaults to 1
 * - m 2-digit minute, left-padded with 0 if required
 * - minute:n n-digit minute, left-padded with 0s if required. n is a minimum (more digits will be used if required),
 *   and defaults to 1
 * - s 2-digit second, left-padded with 0 if required
 * - second:n n-digit second, left-padded with 0s if required. n is a minimum (more digits will be used if required),
 *   and defaults to 1
 * - ms:n n-digit millisecond, left-padded with 0s if required. n is a minimum (more digits will be used if required),
 *   and defaults to 1
 * - Z the offset from UTC as [+-]HH:MM
 * - z the offset from UTC as [+-]HHMM
 * - { a literal {
 */
export class DateTimeFormatter implements DateTimeFormatterInterface
{
    /** Regular expression to extract placeholders from the format string. */
    private static readonly PlaceholderMatcher = /\{([^}]+)(?::([^}]+))?}/;

    /** The available component formatters. */
    private static formatters: ComponentFormatterMap = {};

    /** The format string that the formatter will use. */
    private m_format: string;

    /**
     * Initialise a new formatter with a given format string.
     *
     * @param format The format string.
     */
    public constructor(format: string = "")
    {
        if (0 === Object.keys(DateTimeFormatter.formatters).length) {
            DateTimeFormatter.createInternalFormatters();
        }

        this.m_format = format;
    }

    /** Format string to produce IS8601 date-time strings. */
    public static get formatStringIso8601(): string
    {
        return "{Y}-{M}-{D}T{h}:{m}:{s}.{ms}{Z}";
    }

    /** The format string. */
    public get formatString(): string
    {
        return this.m_format;
    }

    /** Setter for the format string. */
    public set formatString(format: string)
    {
        this.m_format = format;
    }

    /** Helper to (left) pad a number to a given length with a given character. */
    protected static pad(value: number, length: number, ch: string): string
    {
        let str = `${value}`;
        length -= str.length;

        while (0 < length) {
            str = `${ch[0]}${str}`;
            --length;
        }

        return str;
    }

    /** Helper to build the set of internally-provided component formatters on creation of the first DateFormatter instance. */
    private static createInternalFormatters(): void
    {
        DateTimeFormatter.formatters = {
            "{": () => "{",
            "Y": (dateTime: DateTimeInterface) => DateTimeFormatter.pad(dateTime.year % 10000, 4, "0"),
            "y": (dateTime: DateTimeInterface) => DateTimeFormatter.pad(dateTime.year % 100, 2, "0"),
            "year": function(dateTime: DateTimeInterface, args: string): string {
                const digits = Number.parseInt(args ?? "4");
                const year = DateTimeFormatter.pad(dateTime.year, digits, "0");

                if (digits < year.length) {
                    return year.substring(year.length - digits);
                }

                return year;
            },
            "M": (dateTime: DateTimeInterface) => DateTimeFormatter.pad(dateTime.month, 2, "0"),
            "month": (dateTime: DateTimeInterface, args: string) => DateTimeFormatter.pad(dateTime.month, Number.parseInt(args ?? "1"), "0"),
            "D": (dateTime: DateTimeInterface) => DateTimeFormatter.pad(dateTime.day, 2, "0"),
            "day": (dateTime: DateTimeInterface, args: string) => DateTimeFormatter.pad(dateTime.day, Number.parseInt(args ?? "1"), "0"),
            "h": (dateTime: DateTimeInterface) => DateTimeFormatter.pad(dateTime.hour, 2, "0"),
            "hour": (dateTime: DateTimeInterface, args: string) => DateTimeFormatter.pad(dateTime.hour, Number.parseInt(args ?? "1"), "0"),
            "m": (dateTime: DateTimeInterface) => DateTimeFormatter.pad(dateTime.minute, 2, "0"),
            "minute": (dateTime: DateTimeInterface, args: string) => DateTimeFormatter.pad(dateTime.minute, Number.parseInt(args ?? "1"), "0"),
            "s": (dateTime: DateTimeInterface) => DateTimeFormatter.pad(dateTime.second, 2, "0"),
            "second": (dateTime: DateTimeInterface, args: string) => DateTimeFormatter.pad(dateTime.second, Number.parseInt(args ?? "1"), "0"),
            "ms": (dateTime: DateTimeInterface, args: string) => DateTimeFormatter.pad(dateTime.second, Number.parseInt(args ?? "1"), "0"),
            "Z": (dateTime: DateTimeInterface) => (0 > dateTime.timeZone.offset ? "-" : "+") + DateTimeFormatter.pad(Math.floor(Math.abs(dateTime.timeZone.offset) / 60), 2, "0") + ":" + DateTimeFormatter.pad(Math.abs(dateTime.timeZone.offset) % 60, 2, "0"),
            "z": (dateTime: DateTimeInterface) => (0 > dateTime.timeZone.offset ? "-" : "+") + DateTimeFormatter.pad(Math.floor(Math.abs(dateTime.timeZone.offset) / 60), 2, "0") + DateTimeFormatter.pad(Math.abs(dateTime.timeZone.offset) % 60, 2, "0"),
            "weekday": (dateTime: DateTimeInterface, args: string) => {
                if ("short" === args) {
                    switch (dateTime.weekday) {
                        case Weekday.Sunday: return "Sun";
                        case Weekday.Monday: return "Mon";
                        case Weekday.Tuesday: return "Tue";
                        case Weekday.Wednesay: return "Wed";
                        case Weekday.Thursday: return "Thu";
                        case Weekday.Friday: return "Fri";
                        case Weekday.Saturday: return "Sat";
                    }
                }

                switch (dateTime.weekday) {
                    case Weekday.Sunday: return "Sunday";
                    case Weekday.Monday: return "Monday";
                    case Weekday.Tuesday: return "Tuesday";
                    case Weekday.Wednesay: return "Wednesday";
                    case Weekday.Thursday: return "Thursday";
                    case Weekday.Friday: return "Friday";
                    case Weekday.Saturday: return "Saturday";
                }
            },
        };
    }

    /**
     * Add a component formatter.
     *
     * The given specifier must not already exist. Once added, the sequence {specifier} will be replaced with the result
     * of the provided formatter when given the date being formatted.
     *
     * @param specifier The specifier for the component.
     * @param formatter The formatting function.
     */
    public static addFormatter(specifier: string, formatter: ComponentFormatter): void
    {
        if (undefined !== DateTimeFormatter.formatters[specifier]) {
            throw new DateTimeFormatterError(`Format specifier ${specifier} is already taken.`);
        }

        DateTimeFormatter.formatters[specifier] = formatter;
    }

    /**
     * Format a DateTime according to the format string.
     *
     * @param dateTime The DateTime to format.
     */
    public format(dateTime: DateTimeInterface): string
    {
        let format = this.formatString;
        let str: string = "";
        let result: RegExpExecArray;

        while (result = DateTimeFormatter.PlaceholderMatcher.exec(format)) {
            const [match, formatter, args] = result;

            if (undefined === DateTimeFormatter.formatters[formatter]) {
                throw new DateTimeFormatterError(`Undefined component formatter '${formatter}'.`);
            }

            // add any literal content from the format string before the placeholder, followed by the formatted
            // component from the DateTime
            str += format.substring(0, result.index) + DateTimeFormatter.formatters[formatter](dateTime, args);
            format = format.substring(result.index + match.length);
        }

        return str + format;
    }
}
