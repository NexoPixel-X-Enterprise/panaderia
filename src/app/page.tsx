import Inicio from "../components/home/inicio";
import Nosotros from "../components/home/nosotros";
import Ofertas from "../components/home/ofertas";
import Sucursales from "../components/home/sucursales";

export default function Home() {
  return (
    <main>
      <Inicio />
      <Nosotros />
      <Ofertas />
      <Sucursales />
    </main>
  );
}
