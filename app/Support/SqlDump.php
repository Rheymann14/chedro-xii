<?php

namespace App\Support;

use RuntimeException;

/**
 * Reads the rows of extended INSERT statements from a MySQL dump file without
 * loading the dump into a database.
 */
class SqlDump
{
    public function __construct(private string $sql) {}

    public static function fromFile(string $path): self
    {
        $contents = @file_get_contents($path);

        if ($contents === false) {
            throw new RuntimeException("Unable to read the SQL dump at {$path}.");
        }

        return new self($contents);
    }

    /**
     * The rows inserted into the given table, keyed by column name.
     *
     * @return list<array<string, string|null>>
     */
    public function rows(string $table): array
    {
        $pattern = '/INSERT INTO [`"]'.preg_quote($table, '/').'[`"]\s*\(([^)]*)\)\s*VALUES\s*/i';

        preg_match_all($pattern, $this->sql, $matches, PREG_OFFSET_CAPTURE | PREG_SET_ORDER);

        $rows = [];

        foreach ($matches as $match) {
            $columns = array_map(fn (string $column): string => trim($column, ' `"'), explode(',', $match[1][0]));
            $offset = $match[0][1] + strlen($match[0][0]);

            foreach ($this->tuples($offset) as $values) {
                $rows[] = array_combine($columns, $values);
            }
        }

        return $rows;
    }

    /**
     * Parse the value tuples that start at the given offset, up to the
     * statement's terminating semicolon.
     *
     * @return list<list<string|null>>
     */
    private function tuples(int $offset): array
    {
        $length = strlen($this->sql);
        $tuples = [];
        $values = null;
        $position = $offset;

        while ($position < $length) {
            $character = $this->sql[$position];

            if ($values === null) {
                match ($character) {
                    '(' => $values = [],
                    ';' => $position = $length,
                    default => null,
                };
                $position++;

                continue;
            }

            if ($character === ')') {
                $tuples[] = $values;
                $values = null;
                $position++;

                continue;
            }

            if ($character === ',' || ctype_space($character)) {
                $position++;

                continue;
            }

            [$values[], $position] = $character === "'"
                ? $this->quotedString($position)
                : $this->bareValue($position);
        }

        return $tuples;
    }

    /**
     * @return array{0: string, 1: int}
     */
    private function quotedString(int $position): array
    {
        $escapes = ['0' => "\0", 'n' => "\n", 'r' => "\r", 't' => "\t", 'Z' => "\x1A", 'b' => "\x08"];
        $value = '';
        $position++;

        while (true) {
            $plain = strcspn($this->sql, "\\'", $position);
            $value .= substr($this->sql, $position, $plain);
            $position += $plain;

            if ($position >= strlen($this->sql)) {
                throw new RuntimeException('The SQL dump ends inside a quoted string.');
            }

            $character = $this->sql[$position];

            if ($character === '\\') {
                $next = $this->sql[$position + 1];
                $value .= $escapes[$next] ?? $next;
                $position += 2;

                continue;
            }

            if ($character === "'") {
                if (($this->sql[$position + 1] ?? '') === "'") {
                    $value .= "'";
                    $position += 2;

                    continue;
                }

                return [$value, $position + 1];
            }
        }
    }

    /**
     * Read an unquoted value such as a number or NULL.
     *
     * @return array{0: string|null, 1: int}
     */
    private function bareValue(int $position): array
    {
        $end = strcspn($this->sql, ',)', $position) + $position;
        $value = trim(substr($this->sql, $position, $end - $position));

        return [strtoupper($value) === 'NULL' ? null : $value, $end];
    }
}
