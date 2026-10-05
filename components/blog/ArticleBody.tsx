import Image from "next/image";
import Link from "next/link";
import type { ArticleBlock, InlineContent } from "@/lib/blog-types";
import styles from "./blog.module.css";

function Inline({ content }: { content: InlineContent }) {
  if (typeof content === "string") return content;
  return content.map((part, index) => {
    if (typeof part === "string") return part;
    switch (part.type) {
      case "link": return <Link href={part.href} key={index}>{part.text}</Link>;
      case "strong": return <strong key={index}>{part.text}</strong>;
      case "emphasis": return <em key={index}>{part.text}</em>;
      case "arabic": return <bdi dir="rtl" lang="ar" key={index}>{part.text}</bdi>;
    }
  });
}

export function ArticleBody({ blocks }: { blocks: readonly ArticleBlock[] }) {
  return (
    <div className={styles.prose}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph": return <p key={index}><Inline content={block.content} /></p>;
          case "heading": {
            const Heading = block.level === 2 ? "h2" : "h3";
            return <Heading id={block.id} key={block.id}>{block.text}</Heading>;
          }
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return <List key={index}>{block.items.map((item, i) => <li key={i}><Inline content={item} /></li>)}</List>;
          }
          case "arabic": return (
            <figure className={styles.languageExample} key={index}>
              <p dir="rtl" lang="ar">{block.text}</p>
              <figcaption>
                <p className={styles.transliteration}><span>Transliteration</span>{block.transliteration}</p>
                <p><span>Meaning</span>{block.translation}</p>
              </figcaption>
            </figure>
          );
          case "callout": return (
            <aside className={styles.callout} aria-label={block.title} key={index}>
              <strong>{block.title}</strong>
              <p><Inline content={block.content} /></p>
            </aside>
          );
          case "table": return (
            <div className={styles.tableScroll} role="region" aria-label={block.caption} tabIndex={0} key={index}>
              <table>
                <caption>{block.caption}</caption>
                <thead><tr>{block.columns.map((column, i) => <th scope="col" key={i}>{column}</th>)}</tr></thead>
                <tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}><Inline content={cell} /></td>)}</tr>)}</tbody>
              </table>
            </div>
          );
          case "image": return (
            <figure className={styles.figure} key={index}>
              <Image {...block.image} sizes="(max-width: 767px) 90vw, 720px" alt={block.image.alt} />
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          );
        }
      })}
    </div>
  );
}
