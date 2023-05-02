import { expect, test } from "@jest/globals";
import { DateTime } from "../src/DateTime";
import { TimeZone } from "../src/TimeZone";

test("fromDateTime() epoch without ms or timezone", () => {
    const dt = DateTime.fromDateTime(1970, 1, 1, 0, 0, 0);
    expect(dt.timestamp).toEqual(0);
});

test("fromDateTime() epoch with ms without timezone", () => {
    const dt = DateTime.fromDateTime(1970, 1, 1, 0, 0, 0, 0);
    expect(dt.timestamp).toEqual(0);
});

test("fromDateTime() epoch with ms and timezone UTC", () => {
    const dt = DateTime.fromDateTime(1970, 1, 1, 0, 0, 0, 0, TimeZone.utc);
    expect(dt.timestamp).toEqual(0);
});

test("fromDateTime() epoch with ms and timezone America/New_York", () => {
    const dt = DateTime.fromDateTime(1970, 1, 1, 0, 0, 0, 0, new TimeZone("America/New_York"));
    expect(dt.timestamp).toEqual(18000000);
});

test("fromDateTime() with invalid year", () => {
    expect(() => DateTime.fromDateTime(-1, 1, 1, 0, 0, 0))
        .toThrow(/^Expected valid year, found -1.$/);
});

test("fromDateTime() with invalid month (0)", () => {
    expect(() => DateTime.fromDateTime(1970, 0, 1, 0, 0, 0))
        .toThrow(/^Expected valid month, found 0.$/);
});

test("fromDateTime() with invalid month (13)", () => {
    expect(() => DateTime.fromDateTime(1970, 13, 1, 0, 0, 0))
        .toThrow(/^Expected valid month, found 13.$/);
});

test("fromDateTime() with invalid month (-1)", () => {
    expect(() => DateTime.fromDateTime(1970, -1, 1, 0, 0, 0))
        .toThrow(/^Expected valid month, found -1.$/);
});

test("fromDateTime() with invalid day (0)", () => {
    expect(() => DateTime.fromDateTime(1970, 1, 0, 0, 0, 0))
        .toThrow(/^Expected valid day, found 0.$/);
});

test("fromDateTime() with invalid day (32)", () => {
    expect(() => DateTime.fromDateTime(1970, 1, 32, 0, 0, 0))
        .toThrow(/^Expected valid day, found 32.$/);
});

test("fromDateTime() with invalid day (-1)", () => {
    expect(() => DateTime.fromDateTime(1970, 1, -1, 0, 0, 0))
        .toThrow(/^Expected valid day, found -1.$/);
});

test("fromDateTime() with invalid day (31 for April)", () => {
    expect(() => DateTime.fromDateTime(1970, 4, 31, 0, 0, 0))
        .toThrow(/^Expected valid day, found 31.$/);
});

test("fromDateTime() with invalid day (31 for June)", () => {
    expect(() => DateTime.fromDateTime(1970, 6, 31, 0, 0, 0))
        .toThrow(/^Expected valid day, found 31.$/);
});

test("fromDateTime() with invalid day (31 for September)", () => {
    expect(() => DateTime.fromDateTime(1970, 9, 31, 0, 0, 0))
        .toThrow(/^Expected valid day, found 31.$/);
});

test("fromDateTime() with invalid day (31 for November)", () => {
    expect(() => DateTime.fromDateTime(1970, 11, 31, 0, 0, 0))
        .toThrow(/^Expected valid day, found 31.$/);
});

test("fromDateTime() with invalid day (29 for February)", () => {
    expect(() => DateTime.fromDateTime(1971, 2, 29, 0, 0, 0))
        .toThrow(/^Expected valid day, found 29.$/);
});

test("now() returns DateTime instance", () => {
   expect(DateTime.now()).toBeInstanceOf(DateTime);
});

test("now() uses UTC by default", () => {
    expect(DateTime.now().timeZone).toEqual(TimeZone.utc);
});

test("now() uses supplied timezone", () => {
    const tz = new TimeZone(60);
    expect(DateTime.now(tz).timeZone).toEqual(tz);
});

test("now() uses current time", () => {
    const threshold = 500;
    const timestamp = Date.now();
    const dt = DateTime.now();
    expect(dt.timestamp).toBeGreaterThanOrEqual(timestamp);
    expect(dt.timestamp).toBeLessThan(timestamp + threshold);
});

test("parse() rejects malformed string - truncated year", () => {
    expect(() => DateTime.parse("197-01-01T00:00:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "197-01-01T00:00:00\+00:00"\.$/)
})

test("parse() rejects malformed string - non-numeric year", () => {
    expect(() => DateTime.parse("197O-01-01T00:00:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "197O-01-01T00:00:00\+00:00"\.$/)
})

test("parse() rejects malformed string - truncated month", () => {
    expect(() => DateTime.parse("1970-1-01T00:00:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-1-01T00:00:00\+00:00"\.$/)
})

test("parse() rejects malformed string - non-numeric month", () => {
    expect(() => DateTime.parse("1970-O1-01T00:00:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-O1-01T00:00:00\+00:00"\.$/)
})

test("parse() rejects malformed string - invalid month", () => {
    expect(() => DateTime.parse("1970-13-01T00:00:00+00:00"))
        .toThrow(/^Expected valid month, found 13.$/)
})

test("parse() rejects malformed string - truncated day", () => {
    expect(() => DateTime.parse("1970-01-1T00:00:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-1T00:00:00\+00:00"\.$/)
})

test("parse() rejects malformed string - non-numeric day", () => {
    expect(() => DateTime.parse("1970-01-O1T00:00:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-O1T00:00:00\+00:00"\.$/)
})

test("parse() rejects malformed string - invalid day", () => {
    expect(() => DateTime.parse("1970-01-32T00:00:00+00:00"))
        .toThrow(/^Expected valid day, found 32.$/)
})

test("parse() rejects malformed string - truncated hour", () => {
    expect(() => DateTime.parse("1970-01-01T0:00:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-01T0:00:00\+00:00"\.$/)
})

test("parse() rejects malformed string - non-numeric hour", () => {
    expect(() => DateTime.parse("1970-01-01TO0:00:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-01TO0:00:00\+00:00"\.$/)
})

test("parse() rejects malformed string - invalid hour", () => {
    expect(() => DateTime.parse("1970-01-01T25:00:00+00:00"))
        .toThrow(/^Expected valid hour, found 25.$/)
})

test("parse() rejects malformed string - truncated minute", () => {
    expect(() => DateTime.parse("1970-01-01T00:0:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-01T00:0:00\+00:00"\.$/)
})

test("parse() rejects malformed string - non-numeric minute", () => {
    expect(() => DateTime.parse("1970-01-01T00:O0:00+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-01T00:O0:00\+00:00"\.$/)
})

test("parse() rejects malformed string - invalid minute", () => {
    expect(() => DateTime.parse("1970-01-01T00:60:00+00:00"))
        .toThrow(/^Expected valid minute, found 60.$/)
})

test("parse() rejects malformed string - truncated second", () => {
    expect(() => DateTime.parse("1970-01-01T00:00:0+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-01T00:00:0\+00:00"\.$/)
})

test("parse() rejects malformed string - non-numeric second", () => {
    expect(() => DateTime.parse("1970-01-01T00:00:O0+00:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-01T00:00:O0\+00:00"\.$/)
})

test("parse() rejects malformed string - invalid second", () => {
    expect(() => DateTime.parse("1970-01-01T00:00:60+00:00"))
        .toThrow(/^Expected valid second, found 60.$/)
})

test("parse() rejects malformed string - truncated timezone hour", () => {
    expect(() => DateTime.parse("1970-01-01T00:00:00+0:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-01T00:00:00\+0:00"\.$/)
})

test("parse() rejects malformed string - non-numeric timezone hour", () => {
    expect(() => DateTime.parse("1970-01-01T00:00:00+O0:00"))
        .toThrow(/^Expected valid ISO8601 date-time, found "1970-01-01T00:00:00\+O0:00"\.$/)
})
