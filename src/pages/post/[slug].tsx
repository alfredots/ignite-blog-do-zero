import { GetStaticPaths, GetStaticProps } from 'next';
import { FaCalendar } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import Head from 'next/head';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(): JSX.Element {
  // TODO
  return (
    <>
      <Head>Home | post</Head>
      <main className={commonStyles.container}>
        <Header />
        <img
          className={styles.postBanner}
          src="https://s2.glbimg.com/glO0kJHVvbBq18EL9GPsF-sCD7I=/e.glbimg.com/og/ed/f/original/2021/06/24/image_wSBrFOE.png"
          alt="thumbnail post"
        />
        <section className={styles.post}>
          <h1 className={styles.postTitle}>Criando um app CRA do zero</h1>
          <div>
            <time>
              <FaCalendar />
              15 Mar 2021
            </time>
            <span>
              <FaUser />
              Joseph Oliveira
            </span>
          </div>
        </section>
      </main>
    </>
  );
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID(TODO);

//   // TODO
// };
