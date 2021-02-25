import * as es from '@elastic/elasticsearch';

import { Core, ICoreOptions } from './core';
import { Indices } from './indices';

export interface IConfigOptions extends es.ClientOptions {
  indexPrefix?: string;
  client?: es.Client;
}

export class Elasticsearch extends Core {
  /**
   * Split IConfigOptions into ClientOptions and ICoreOptions
   * @param options
   */
  private static splitOptions(options: IConfigOptions): { clientOptions: es.ClientOptions; coreOptions: ICoreOptions } {
    const coreOptions: ICoreOptions = {};
    const clientOptions = { ...options };

    delete clientOptions.indexPrefix;
    delete clientOptions.client;

    coreOptions.indexPrefix = options.indexPrefix;

    return { clientOptions, coreOptions };
  }
  public indices: Indices;

  constructor(clientOrOptions: es.Client | IConfigOptions) {
    let client: es.Client;
    let coreOptions: ICoreOptions = {};
    let clientOptions: es.ClientOptions = {};

    if (clientOrOptions.constructor && clientOrOptions instanceof es.Client) {
      client = clientOrOptions as es.Client;
    } else {
      const options: IConfigOptions = clientOrOptions as IConfigOptions;
      ({ coreOptions, clientOptions } = Elasticsearch.splitOptions(options));
      client = options.client || new es.Client(clientOptions);
    }

    super(client, coreOptions);
    this.indices = new Indices(client, coreOptions);
  }
}
