import React, {ReactNode} from 'react'
import {SiHtml5, SiCss3, SiJavascript, SiTypescript, SiJson, SiSass, SiReact, SiStylus, SiCplusplus, SiDart, SiGo, SiKotlin, SiLess, SiPhp, SiPython, SiRuby, SiRust, SiScala, SiSwift, SiXml, SiYaml, SiGit} from "react-icons/si";
import {FcFolder, FcOpenedFolder, FcPicture, FcFile} from "react-icons/fc";
import {AiFillFileText} from "react-icons/ai";
import {BsFileEarmarkCode} from "react-icons/bs";
import {VscJson} from "react-icons/vsc";

function getIconHelper() {
  const cache = new Map<string, ReactNode>();


  cache.set("js", <SiJavascript className="text-yellow-500" />);
  cache.set("jsx", <SiReact className="text-blue-400" />);
  cache.set("ts", <SiTypescript className="text-blue-600" />);
  cache.set("tsx", <SiReact className="text-blue-400" />);
  cache.set("html", <SiHtml5 className="text-orange-600" />);
  cache.set("htm", <SiHtml5 className="text-orange-600" />);
  cache.set("css", <SiCss3 className="text-blue-500" />);
  cache.set("scss", <SiSass className="text-pink-500" />);
  cache.set("sass", <SiSass className="text-pink-500" />);
  cache.set("less", <SiLess className="text-blue-700" />);
  cache.set("styl", <SiStylus className="text-green-600" />);
  cache.set("json", <VscJson className="text-yellow-600" />);
  cache.set("xml", <SiXml className="text-orange-500" />);
  cache.set("yaml", <SiYaml className="text-red-500" />);
  cache.set("yml", <SiYaml className="text-red-500" />);

  // Programming Languages
  cache.set("py", <SiPython className="text-blue-500" />);
  // cache.set("java", <SiJava className="text-red-600" />);
  cache.set("cpp", <SiCplusplus className="text-blue-600" />);
  cache.set("cxx", <SiCplusplus className="text-blue-600" />);
  cache.set("cc", <SiCplusplus className="text-blue-600" />);
  cache.set("c", <BsFileEarmarkCode className="text-blue-500" />);
  cache.set("h", <BsFileEarmarkCode className="text-blue-400" />);
  // cache.set("cs", <SiCsharp className="text-purple-600" />);
  cache.set("php", <SiPhp className="text-purple-500" />);
  cache.set("rb", <SiRuby className="text-red-500" />);
  cache.set("go", <SiGo className="text-cyan-500" />);
  cache.set("rs", <SiRust className="text-orange-700" />);
  cache.set("swift", <SiSwift className="text-orange-500" />);
  cache.set("kt", <SiKotlin className="text-purple-500" />);
  cache.set("dart", <SiDart className="text-blue-500" />);
  cache.set("scala", <SiScala className="text-red-600" />);
  cache.set("r", <BsFileEarmarkCode className="text-blue-400" />);
  cache.set("m", <BsFileEarmarkCode className="text-gray-600" />);


  cache.set("app", <FcFolder className="text-green-800"/>);
  cache.set("src", <FcFolder className="text-green-800"/>);

  cache.set("closedDirectory", <FcFolder/>);
  cache.set("openDirectory", <FcOpenedFolder/>);

  // Version Control
  cache.set("gitignore", <SiGit className="text-orange-500" />);
  cache.set("gitattributes", <SiGit className="text-orange-500" />);
  cache.set("gitmodules", <SiGit className="text-orange-500" />);

  return function (extension: string, name: string): ReactNode {
    if (cache.has(extension))
      return cache.get(extension);
    else if (cache.has(name))
      return cache.get(name);
    else
      return <FcFile/>;
  }
}

export const getIcon = getIconHelper();



