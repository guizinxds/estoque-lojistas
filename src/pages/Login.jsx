export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <form>
        <input type="email" placeholder="E-mail" required />
        <input type="password" placeholder="Senha" required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
