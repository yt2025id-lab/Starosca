// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TimeLib
/// @notice Date/time helpers for determining payment windows in Starosca
/// @dev Uses BokkyPooBah's DateTime Library algorithm for timestamp <-> date conversion
library TimeLib {
    uint256 constant SECONDS_PER_DAY = 86400;
    uint256 constant OFFSET19700101 = 2440588;

    // Payment window boundaries (day of month)
    uint8 constant ON_TIME_START = 1;
    uint8 constant ON_TIME_END = 10;    // Inclusive: days 1-10
    uint8 constant LATE_END = 24;        // Late: days 11-24
    uint8 constant DRAWING_DAY = 25;     // Drawing on the 25th

    enum PaymentWindow {
        ON_TIME,        // Day 1-10: eligible for yield
        LATE,           // Day 11-24: no yield but counts as paid
        DRAWING_OR_AFTER, // Day 25+: counts as next month
        BEFORE_START    // Before pool start
    }

    /// @notice Convert timestamp to (year, month, day)
    /// @dev Based on BokkyPooBah's DateTime Library
    function timestampToDate(uint256 timestamp)
        internal
        pure
        returns (uint256 year, uint256 month, uint256 day)
    {
        uint256 _days = timestamp / SECONDS_PER_DAY;
        uint256 L = _days + 68569 + OFFSET19700101;
        uint256 N = (4 * L) / 146097;
        L = L - (146097 * N + 3) / 4;
        uint256 _year = (4000 * (L + 1)) / 1461001;
        L = L - (1461 * _year) / 4 + 31;
        uint256 _month = (80 * L) / 2447;
        uint256 _day = L - (2447 * _month) / 80;
        L = _month / 11;
        _month = _month + 2 - 12 * L;
        _year = 100 * (N - 49) + _year + L;

        year = _year;
        month = _month;
        day = _day;
    }

    /// @notice Convert (year, month, day) to timestamp (midnight UTC)
    function dateToTimestamp(uint256 year, uint256 month, uint256 day)
        internal
        pure
        returns (uint256 timestamp)
    {
        int256 _year = int256(year);
        int256 _month = int256(month);
        int256 _day = int256(day);

        int256 __days = _day
            - 32075
            + 1461 * (_year + 4800 + (_month - 14) / 12) / 4
            + 367 * (_month - 2 - (_month - 14) / 12 * 12) / 12
            - 3 * ((_year + 4900 + (_month - 14) / 12) / 100) / 4
            - int256(OFFSET19700101);

        timestamp = uint256(__days) * SECONDS_PER_DAY;
    }

    /// @notice Get the day of month from a timestamp
    function getDayOfMonth(uint256 timestamp) internal pure returns (uint8) {
        (, , uint256 day) = timestampToDate(timestamp);
        return uint8(day);
    }

    /// @notice Get year and month from timestamp
    function getYearMonth(uint256 timestamp) internal pure returns (uint256 year, uint256 month) {
        (year, month, ) = timestampToDate(timestamp);
    }

    /// @notice Calculate timestamp for the 1st of a given month
    function firstOfMonth(uint256 year, uint256 month) internal pure returns (uint256) {
        return dateToTimestamp(year, month, 1);
    }

    /// @notice Calculate timestamp for the 25th of a given month
    function drawingDay(uint256 year, uint256 month) internal pure returns (uint256) {
        return dateToTimestamp(year, month, DRAWING_DAY);
    }

    /// @notice Get the 1st of the next month
    function firstOfNextMonth(uint256 year, uint256 month) internal pure returns (uint256) {
        if (month == 12) {
            return dateToTimestamp(year + 1, 1, 1);
        }
        return dateToTimestamp(year, month + 1, 1);
    }

    /// @notice Determine which payment window the current timestamp falls in
    /// @param timestamp Current timestamp
    /// @param poolStartTimestamp When the pool started (1st of the start month)
    /// @return window The payment window type
    /// @return poolMonth The month number (1-indexed) this payment is for
    function getPaymentWindow(uint256 timestamp, uint256 poolStartTimestamp)
        internal
        pure
        returns (PaymentWindow window, uint8 poolMonth)
    {
        if (timestamp < poolStartTimestamp) {
            return (PaymentWindow.BEFORE_START, 0);
        }

        uint8 day = getDayOfMonth(timestamp);

        // Calculate which pool month we're in
        (uint256 startYear, uint256 startMonth, ) = timestampToDate(poolStartTimestamp);
        (uint256 curYear, uint256 curMonth, ) = timestampToDate(timestamp);

        // Pool month = months elapsed since start + 1
        poolMonth = uint8(
            (curYear * 12 + curMonth) - (startYear * 12 + startMonth) + 1
        );

        // If we're on/after the 25th, payment goes to next month
        if (day >= DRAWING_DAY) {
            window = PaymentWindow.DRAWING_OR_AFTER;
            poolMonth += 1; // Payment counts for next month
        } else if (day >= ON_TIME_START && day <= ON_TIME_END) {
            window = PaymentWindow.ON_TIME;
        } else {
            // Day 11-24
            window = PaymentWindow.LATE;
        }
    }

    /// @notice Check if it's drawing day (25th) or later in the current month
    function isDrawingDay(uint256 timestamp) internal pure returns (bool) {
        uint8 day = getDayOfMonth(timestamp);
        return day >= DRAWING_DAY;
    }

    /// @notice Calculate days from a payment timestamp until the 25th of that month
    /// @dev Used for yield calculation — more days = more yield
    function daysUntilDrawing(uint256 paymentTimestamp) internal pure returns (uint8) {
        uint8 day = getDayOfMonth(paymentTimestamp);
        if (day >= DRAWING_DAY) return 0;
        return DRAWING_DAY - day;
    }

    /// @notice Get the drawing timestamp (25th at midnight UTC) for a specific pool month
    function getDrawingTimestamp(uint256 poolStartTimestamp, uint8 month)
        internal
        pure
        returns (uint256)
    {
        (uint256 startYear, uint256 startMonth, ) = timestampToDate(poolStartTimestamp);

        // Calculate target year/month
        uint256 totalMonths = startMonth + month - 1; // 0-indexed months from Jan
        uint256 targetYear = startYear + (totalMonths - 1) / 12;
        uint256 targetMonth = ((totalMonths - 1) % 12) + 1;

        return dateToTimestamp(targetYear, targetMonth, DRAWING_DAY);
    }

    /// @notice Get the finalization timestamp (1st of month after last drawing)
    function getFinalizationTimestamp(uint256 poolStartTimestamp, uint8 totalMonths)
        internal
        pure
        returns (uint256)
    {
        (uint256 startYear, uint256 startMonth, ) = timestampToDate(poolStartTimestamp);

        uint256 totalM = startMonth + totalMonths;
        uint256 targetYear = startYear + (totalM - 1) / 12;
        uint256 targetMonth = ((totalM - 1) % 12) + 1;

        return dateToTimestamp(targetYear, targetMonth, 1);
    }
}
