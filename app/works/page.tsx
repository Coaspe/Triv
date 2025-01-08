/** @format */

import { db } from "@/lib/firebase/admin";
import WorkPage from "../../components/WorkPage";
import { Work } from "../types";

async function getWorks(): Promise<Work[]> {
  const worksSnapshot = await db.collection("works").get();
  const works = worksSnapshot.docs.map((doc) => doc.data() as Work);

  // 순서대로 정렬
  const orderedWorks: Work[] = [];
  let currentWork = works.find((work) => !work.prevWork);

  while (currentWork) {
    orderedWorks.push(currentWork);
    currentWork = works.find((work) => work.prevWork === currentWork?.id);
  }

  return orderedWorks;
}

export default async function WorksPage() {
  const works = await getWorks();

  return <WorkPage title="WORKS" works={works} />;
}
