import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { DECORATORS } from '@nestjs/swagger/dist/constants';

export interface IFilter {
  take?: number;
  skip?: number;
  where?: Record<string, any>;
  include?: Record<string, boolean | any>;
  orderBy?: Record<string, 'asc' | 'desc' | any>;
  select?: Record<string, boolean | any>;
}

const parseJSON = (value: any): any => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
};

const parseNumber = (value: string | number, defaultValue = 0): number => {
  if (typeof value === 'number') return value;
  const num = Number(value);
  return !isNaN(num) ? num : defaultValue;
};

export const Filter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IFilter => {
    const { take, skip, where, include, select, orderBy } = ctx
      .switchToHttp()
      .getRequest().query;

    const filter: IFilter = {};

    if (where) filter.where = parseJSON(where);
    filter.take = parseNumber(take, 10);
    filter.skip = parseNumber(skip, 0);
    if (include) filter.include = parseJSON(include);
    if (orderBy) filter.orderBy = parseJSON(orderBy);
    if (select && !filter.include) filter.select = parseJSON(select);

    return filter;
  },
  [
    (target, key) => {
      const existing =
        Reflect.getMetadata(DECORATORS.API_PARAMETERS, target[key]) ?? [];
      const example = `{
  "where": { "field": "value" },
  "take": 10,
  "skip": 0,
  "include": { "field": true },
  "orderBy": { "field": "asc" },
  "select": { "field": "value" }
}`;

      Reflect.defineMetadata(
        DECORATORS.API_PARAMETERS,
        [
          ...existing,
          {
            in: 'query',
            name: 'filter',
            required: false,
            type: 'object',
            example
          }
        ],
        target[key]
      );
    }
  ]
);
