#!/usr/bin/env -S deno run
/// <reference lib="deno.ns" />
import { Command } from 'jsr:@cliffy/command@^1';
import * as z from 'zod';
import pkg from '../package.json' with { type: 'json' };
import { MapConfigSchema } from './schemas';

await new Command()
  .name('nina-map-validate')
  .version(pkg.version)
  .description('Validate a nina-maps JSON configuration read from stdin.')
  .option('--raw', 'Output the raw zod error tree as JSON instead of prettified text.')
  .action(async ({ raw }) => {
    let input: string;
    try {
      input = await new Response(Deno.stdin.readable).text();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error reading input: ${message}`);
      Deno.exit(1);
    }

    let data: unknown;
    try {
      data = JSON.parse(input);
    } catch {
      console.error('Error: input is not valid JSON');
      Deno.exit(1);
    }

    const result = MapConfigSchema.safeParse(data);

    if (result.success) {
      console.log('Valid map configuration.');
    } else {
      const message = raw ? JSON.stringify(z.treeifyError(result.error), null, 2) : z.prettifyError(result.error);
      console.error(message);
      Deno.exit(1);
    }
  })
  .parse(Deno.args);
