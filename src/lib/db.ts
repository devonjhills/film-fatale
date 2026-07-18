import { getCloudflareContext } from "@opennextjs/cloudflare";

// SQL determines row shapes at runtime, matching D1's loose result-row typing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryResult = any;
type BindValue = string | number | null;

type D1Result = {
  results?: QueryResult[];
};

type D1Statement = {
  bind: (...values: BindValue[]) => D1Statement;
  all: () => Promise<D1Result>;
  run: () => Promise<unknown>;
};

type D1Binding = {
  prepare: (query: string) => D1Statement;
};

function getD1(): D1Binding | null {
  try {
    const { env } = getCloudflareContext();
    return (env as typeof env & { DB?: D1Binding }).DB || null;
  } catch {
    return null;
  }
}

export function hasDatabase(): boolean {
  return getD1() !== null;
}

function isReadQuery(query: string): boolean {
  return /^\s*(SELECT|PRAGMA|WITH)\b/i.test(query);
}

async function executeD1(
  database: D1Binding,
  query: string,
  values: unknown[],
): Promise<QueryResult[]> {
  const statement = database
    .prepare(query)
    .bind(
      ...values.map((value) =>
        typeof value === "boolean" ? Number(value) : (value as BindValue),
      ),
    );

  if (!isReadQuery(query)) {
    await statement.run();
    return [];
  }

  const result = await statement.all();
  return result.results || [];
}

function taggedQuery(
  strings: TemplateStringsArray,
  values: unknown[],
): string {
  return strings.reduce(
    (query, part, index) => query + part + (index < values.length ? "?" : ""),
    "",
  );
}

function positionalQuery(query: string, params: unknown[]) {
  const values: unknown[] = [];
  const sqlText = query.replace(/\$(\d+)/g, (_match, position: string) => {
    values.push(params[Number(position) - 1]);
    return "?";
  });
  return { sqlText, values };
}

export const sql = Object.assign(
  async (strings: TemplateStringsArray | string, ...values: unknown[]) => {
    const d1 = getD1();
    if (!d1) throw new Error("D1 database binding not found");

    if (Array.isArray(strings)) {
      const rows = await executeD1(
        d1,
        taggedQuery(strings as TemplateStringsArray, values),
        values,
      );
      return { rows };
    }

    if (typeof strings === "string") {
      const params = (values[0] as unknown[]) || [];
      const converted = positionalQuery(strings, params);
      const rows = await executeD1(d1, converted.sqlText, converted.values);
      return { rows };
    }

    throw new Error("Invalid SQL query");
  },
  {
    query: async (query: string, params: unknown[] = []) => {
      const d1 = getD1();
      if (!d1) throw new Error("D1 database binding not found");
      const converted = positionalQuery(query, params);
      const rows = await executeD1(d1, converted.sqlText, converted.values);
      return { rows };
    },
  },
);
