import * as z from 'zod';
import pkg from '../package.json' with { type: 'json' };
import { MapConfigSchema } from './schemas';

export { MapConfigSchema };

export function buildSchema() {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Nina Maps Configuration',
    description: 'Configuration schema for a nina-maps map.',
    version: pkg.version,
    ...z.toJSONSchema(MapConfigSchema),
  };
}

export function validateConfig(data: unknown) {
  return MapConfigSchema.safeParse(data);
}

export function buildOpenApiSpec() {
  const mapConfigSchema = z.toJSONSchema(MapConfigSchema, { target: 'openapi3.1' });

  return {
    openapi: '3.1.0',
    info: {
      title: 'Nina Maps API',
      description: 'Validation API for nina-maps configurations.',
      version: pkg.version,
    },
    paths: {
      '/api/validate': {
        post: {
          summary: 'Validate a map configuration',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: mapConfigSchema } },
          },
          responses: {
            '200': {
              description: 'Configuration is valid',
              content: {
                'application/json': { schema: { type: 'object', properties: { valid: { type: 'boolean' } } } },
              },
            },
            '400': {
              description: 'Invalid JSON body',
              content: {
                'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } },
              },
            },
            '422': {
              description: 'Validation failed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      valid: { type: 'boolean' },
                      errors: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/schema': {
        get: {
          summary: 'Get the JSON Schema for a map configuration',
          responses: {
            '200': {
              description: 'JSON Schema object',
              content: { 'application/json': { schema: { type: 'object' } } },
            },
          },
        },
      },
    },
  };
}
