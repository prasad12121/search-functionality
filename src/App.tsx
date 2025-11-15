import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import styles from "./App.module.css";
import { List } from "./components/list";
import { SearchForm } from "./components/search-form";

const API_BASE = "https://hn.algolia.com/api/v1";
const API_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";

const getUrl = (searchTerm:string, page:number) =>
  `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

const extractSearchTerm = (urlAdd:string) =>
  urlAdd
    .substring(urlAdd.lastIndexOf("?") + 1, urlAdd.lastIndexOf("&"))
    .replace(PARAM_SEARCH, "");

const getLastSearches = (url:string[]) =>
  url
    .reduce<string[]>((result, urlAdd, index) => {
      const searchTerm = extractSearchTerm(urlAdd);

      if (index === 0) {
        return result.concat(searchTerm);
      }
      const previousSearchTerm = result[result.length - 1];

      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, [])
    .slice(-6)
    .slice(0, -1);

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type StoriesState = {
  data: Story[];
  page: number;
  isLoading: boolean;
  isError: boolean;
};

type StoriesFetchInitAction = {
  type: "STORIES_FETCH_INIT";
};

type StoriesFetchSuccessAction = {
  type: "STORIES_FETCH_SUCCESS";
  payload: {
    list:Story[];
    page:number;
  };
};

type StoriesFetchFailureAction = {
  type: "STORIES_FETCH_FAILURE";
};

type StoriesRemoveAction = {
  type: "REMOVE_STORY";
  payload: Story;
};

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };

    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data:
          action.payload.page === 0
            ? action.payload.list
            : state.data.concat(action.payload.list),
        page: action.payload.page,
      };

    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };

    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error("Unhandled action type");
  }
};

const useStorageState = (
  key: string,
  initialState: string
): [string, (newValue: string) => void] => {
  const isMounted = useRef(false);
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

function App() {
  const [searchTerm, setSearchTerm] = useStorageState("search", "react");

  const [url, setUrl] = useState<string[]>([getUrl(searchTerm, 0)]);

  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    page: 0,
    isLoading: false,
    isError: false,
  });

  const handleFetchStories = useCallback(async () => {
    if (!searchTerm) return;
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const lastUrl = url[url.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: {
          list: result.data?.hits || [],
          page: result.data.page,
        },
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url, searchTerm]);

  useEffect(() => {
    console.log("How many times do I log?");
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = useCallback((item: Story) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  }, []);

  const handleSearch = (searchTerm: string, page: number) => {
    const urlAdd = getUrl(searchTerm, page);
    setUrl(url.concat(urlAdd));
  };

  const handleSearchSubmit = () => handleSearch(searchTerm, 0);

  const searchedStories = (stories.data ?? []).filter((story) =>
    story.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLastSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm, 0);
  };

  const lastSearches = getLastSearches(url);

  const handleMore = () => {
    const lastUrl = url[url.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>my stories here...</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
        searchAction={handleSearchSubmit}
      />

      <LastSearches
        lastSearches={lastSearches}
        onLastSearch={handleLastSearch}
      />

      <hr />
      {stories.isError && <p>something went wrong</p>}
      {stories.isLoading ? (
        <p> ....loading yyyyyyyajsdjhasd</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      )}

      <button type="button" onClick={handleMore}>
        More
      </button>
    </div>
  );
}

const LastSearches = ({
  lastSearches,
  onLastSearch,
}: {
  lastSearches: string[];
  onLastSearch: (searchTerm: string) => void;
}) => (
  <>
    {lastSearches.map((searchTerm, index) => (
      <button
        key={searchTerm + index}
        type="button"
        onClick={() => onLastSearch(searchTerm)}
      >
        {searchTerm}
      </button>
    ))}
  </>
);

export default App;