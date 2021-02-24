import * as es from '@elastic/elasticsearch';
import { ICoreOptions } from './core';
import { Elasticsearch, IConfigOptions } from './elasticsearch';
import { Indices } from './indices';

jest.mock('@elastic/elasticsearch', () => {
  const jestConstructor = jest.fn();

  class Client {
    constructor(params: any) {
      jestConstructor(params);
    }
  }

  return {
    jestConstructor,
    Client,
  };
});

beforeEach(() => jest.clearAllMocks());

describe('constructor', () => {
  describe('without core options', () => {
    it('use instanciated client', () => {
      const client = new es.Client({ node: 'localhost:9200' });
      const service = new Elasticsearch(client);
      expect((service as any).client).toBe(client);
      expect((es as any).jestConstructor).toHaveBeenCalledTimes(1);
    });

    it('instanciate a Client with passed parameters', () => {
      const params = { node: 'localhost:9200' };
      const service = new Elasticsearch(params);
      expect((service as any).client).toBeInstanceOf(es.Client);
      expect((es as any).jestConstructor).toHaveBeenCalledTimes(1);
      expect((es as any).jestConstructor).toHaveBeenCalledWith(params);
    });

    it('instanciate Indices with the internal client', () => {
      const service = new Elasticsearch({});
      expect(service.indices).toBeInstanceOf(Indices);
      expect((service.indices as any).client).toBe((service as any).client);
    });
  });

  describe('with core options', () => {
    it('use instanciated client', () => {
      const client = new es.Client({ node: 'localhost:9200' });
      const service = new Elasticsearch({ client, indexPrefix: 'es1_' });
      expect((service as any).client).toBe(client);
      expect((es as any).jestConstructor).toHaveBeenCalledTimes(1);
      expect((service as any).options).toEqual({ indexPrefix: 'es1_' });
    });

    it('instanciate a Client with passed parameters', () => {
      const service = new Elasticsearch({ node: 'localhost:9200', indexPrefix: 'es1_' });
      expect((service as any).client).toBeInstanceOf(es.Client);
      expect((es as any).jestConstructor).toHaveBeenCalledTimes(1);
      expect((es as any).jestConstructor).toHaveBeenCalledWith({ node: 'localhost:9200' });
      expect((service as any).options).toEqual({ indexPrefix: 'es1_' });
    });

    it('instanciate Indices with the internal client and core options', () => {
      const service = new Elasticsearch({ indexPrefix: 'es1_' });
      expect(service.indices).toBeInstanceOf(Indices);
      expect((service.indices as any).client).toBe((service as any).client);
      expect((service.indices as any).options).toEqual({ indexPrefix: 'es1_' });
    });
  });
});

describe('splitOptions', () => {
  const splitOptions: (options: IConfigOptions) => { clientOptions: es.ClientOptions; coreOptions: ICoreOptions } = (Elasticsearch as any)
    .splitOptions;

  it('accepts empty', () => {
    expect(splitOptions({})).toEqual({ clientOptions: {}, coreOptions: {} });
  });

  it('remove internal options', () => {
    expect(splitOptions({ client: new es.Client({}) })).toEqual({ clientOptions: {}, coreOptions: {} });
  });

  it('extract coreOptions', () => {
    expect(splitOptions({ indexPrefix: 'es_' })).toEqual({ clientOptions: {}, coreOptions: { indexPrefix: 'es_' } });
  });

  it('extract client config options', () => {
    expect(splitOptions({ node: 'localhost:9200' })).toEqual({ clientOptions: { node: 'localhost:9200' }, coreOptions: {} });
  });
});
