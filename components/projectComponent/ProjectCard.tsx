import { JSX } from "react";


export default function projectCard({name}:{
    name: string;
}):JSX.Element {
  // this component is used to display a project card with project name
  return (
    <div className="font-semibold text-lg bg-blue-950 text-white">
        {name}
    </div>
  )
}
