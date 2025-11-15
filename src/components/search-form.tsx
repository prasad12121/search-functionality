
import styles from "../App.module.css";
import clsx from "clsx";
import { InputWithLabel } from "./input-with-label";

type SearchFormProps = {
    searchTerm: string;
    onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    searchAction: (formData: FormData) => void;
  };
  
  const SearchForm = ({
    searchTerm,
    onSearchInput,
    searchAction,
  }: SearchFormProps) => (
    <form action={searchAction} className={styles.searchForm}>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={onSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>
  
      <button
        type="submit"
        disabled={!searchTerm}
        className={clsx(styles.button, styles.buttonLarge)}
      >
        Submit
      </button>
    </form>
  );

export {SearchForm}


