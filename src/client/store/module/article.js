import _ from 'lodash';
import { log } from '../../helper/logger';
import articleHelper from '../../helper/article';
import {
  STATUS_SET, STATUS_FETCH, STATUS_GOT, STATUS_404,
} from './status';
import config from '../../config';

const ARTICLE_FETCH = 'article:fetch';
const ARTICLE_SET = 'article:set';
const ARTICLE_RECENT = 'article:recent';
const ARTICLE_RECENT_PARAMS = 'article:recent:params';
const ARTICLE_SEARCH = 'article:search';
const type = 'article';

const { path, pagination } = config;

const article = {
  state: {
    articles: {},
    recentArticles: null,
    recentArticlesParams: null,
    searchArticles: { total: 0, items: [] },
  },
  getters: {
    articles: state => state.articles,
    recentArticles: state => state.recentArticles,
    searchArticles: state => state.searchArticles,
  },
  mutations: {
    [ARTICLE_SET]: (state, articles) => {
      Object.keys(articles).forEach((id) => {
        state.articles[id] = articles[id];
      });
    },
    [ARTICLE_RECENT]: (state, articles) => {
      articleHelper.setDefaultCover(articles);
      state.recentArticles = articles;
    },
    [ARTICLE_SEARCH]: (state, value) => {
      articleHelper.setDefaultCover(value);
      state.searchArticles = value;
    },
    [ARTICLE_RECENT_PARAMS]: (state, value) => {
      state.recentArticlesParams = value;
    },
  },
  actions: {
    [ARTICLE_FETCH]: async ({
      commit, state, getters,
    }, { id }) => {
      if (
        getters.articleStatus === STATUS_404
        || (getters.articleStatus === STATUS_GOT && state.articles[id])
      ) {
        return state.article;
      }

      let arc;
      try {
        commit(STATUS_SET, { type, status: STATUS_FETCH });
        const res = await getters.Article.get(id);
        if (res.data) {
          arc = res.data;
        }
        commit(STATUS_SET, { type, status: STATUS_GOT });
      } catch (e) {
        if (e.response.status === 404) {
          log(`article id:${id} not found`);
        }
        commit(STATUS_SET, { type, status: STATUS_404 });
      }
      commit(ARTICLE_SET, { [id]: arc });

      return arc;
    },
    [ARTICLE_RECENT]: async ({
      commit, getters, state,
    }, params = { limit: '0,3' }) => {
      if (state.recentArticles && _.isEqual(state.recentArticlesParams, params)) {
        return state.recentArticles;
      }
      commit(ARTICLE_RECENT_PARAMS, params);
      const [from, size] = String(params.limit).split(',').map(item => +item);
      const res = await getters.Article.query({
        _from: from,
        _size: size,
        _sort: 'id',
        _dir: 'DESC',
      });
      const items = res.data.items.map((item) => {
        item.url = getters.isPublish
          ? `/article/${item.id}` : `${path.user}/article/${item.id}`;
        return item;
      });
      commit(ARTICLE_RECENT, items);
      return items;
    },
    [ARTICLE_SEARCH]: async ({
      commit, getters,
    }, params = { keyword: 'foo', _page: 1, _num: pagination.num }) => {
      const res = await getters.Common.search(params);
      const { total } = res.data;
      const items = res.data.items.map((item) => {
        item.url = getters.isPublish
          ? `/article/${item.id}` : `${path.user}/article/${item.id}`;
        return item;
      });
      commit(ARTICLE_SEARCH, {
        items,
        total,
      });
      return items;
    },
  },
};

export {
  ARTICLE_FETCH,
  ARTICLE_RECENT,
  ARTICLE_SEARCH,
  article,
};
