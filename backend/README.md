# EbTaskier - Backend

## Recursos

### Usuários

Sistema de cadastro de usuários com email, senha e nome de usuário.
Usa par de tokens bearer de acesso/refresh.

#### Endpoints

> POST /users
> 
> Sem auth
> JSON body (JSONSchema):
> ```js
> {
>   type: 'object',
>   properties: {
>     username: { type: 'string', minLength: 3, maxLength: 100 },
>     password: { type: 'string', minLength: 6, maxLength: 36 },
>     email: { type: 'string', maxLength: 256, format: 'email' },
>   },
>   required: ['username', 'password', 'email'],
>   additionalProperties: false,
> }
> ```

Cria um usuário novo. Retorna um par de tokens de acesso como cookies nos headers.

> GET /users/me
> 
> Auth: Bearer Access Token
> Sem corpo

Retorna os dados do usuário portador do token.

> POST /users/session
