import {React,useEffect,useRef} from "react";
import styles from "../App.module.css";


type InputWithLabelProps = {
    id: string;
    value: string;
    type?: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isFocused?: boolean;
    children: React.ReactNode;
  };

  
  const InputWithLabel = ({
    id,
    value,
    type = "text",
    onInputChange,
    isFocused,
    children,
  }:InputWithLabelProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isFocused]);
  
    return (
      <>
        <label htmlFor={id} className={styles.label}>
          {children}
        </label>
        &nbsp;
        <input
          id={id}
          type={type}
          value={value}
          autoFocus={isFocused}
          onChange={onInputChange}
          className={styles.input}
        />
      </>
    );
  };

  export {InputWithLabel}