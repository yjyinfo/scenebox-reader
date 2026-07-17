import Reader from "./components/Reader";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <h1 className="sr-only">
        SceneBox Reader - 在线阅读 EPUB 电子书，支持单页连续、双页、双页连续视图
      </h1>
      <Reader />
    </main>
  );
}
