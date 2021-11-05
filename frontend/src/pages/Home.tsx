import { useCallback, useRef } from 'react';

const baseUrl = 'https://eb-taskier.herokuapp.com';

function Home() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const usernameLoginRef = useRef<HTMLInputElement>(null);
  const passwordLoginRef = useRef<HTMLInputElement>(null);

  const handleSubmitRegister = useCallback((e) => {
    e.preventDefault();

    if (
        !usernameRef.current ||
        !emailRef.current ||
        !passwordRef.current
      )
    return;

    const userData = {
      username: usernameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    fetch(`${baseUrl}/users`,{
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      console.log(response);
      console.log(response.headers);
    })
  }, []);

  const handleSubmitLogin = useCallback((e) => {
    e.preventDefault();

    if (
        !usernameLoginRef.current ||
        !passwordLoginRef.current
      )
    return;

    const userData = {
      username: usernameLoginRef.current.value,
      password: passwordLoginRef.current.value,
    };

    fetch(`${baseUrl}/users/session`,{
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      console.log(response);
      console.log(response.headers);
    })
  }, []);

  return(
    <>
      <form onSubmit={ handleSubmitRegister }>
        <label htmlFor="username">
          <p>Nome de usuario</p>
          <input type="text" id="username" ref={ usernameRef } />
        </label>
        <label htmlFor="email">
          <p>E-mail</p>
          <input type="email" id="email" ref={ emailRef } />
        </label>
        <label htmlFor="password">
          <p>Senha</p>
          <input type="text" id="password" ref={ passwordRef } />
        </label>
        <button>Registrar</button>
      </form>

      <form onSubmit={ handleSubmitLogin }>
        <label htmlFor="username">
          <p>Nome de usuario</p>
          <input type="text" id="username" ref={ usernameLoginRef } />
        </label>
        <label htmlFor="password">
          <p>Senha</p>
          <input type="text" id="password" ref={ passwordLoginRef } />
        </label>
        <button>Fazer Login</button>
      </form>
    </>
  );
}

export default Home;
