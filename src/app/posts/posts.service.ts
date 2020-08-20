import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class PostsService {
  private posts: Post[] = [];
  private postUpdatedObserver = new Subject<{ posts: Post[], postCount: number }>();

  constructor(private httpClient: HttpClient, private router: Router) { }
  /** Get Copy of All Posts */
  getPosts(postsPerPage: number, currentPage: number): any {

    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;

    this.httpClient.get<{ message: string, posts: any, maxPosts: number }>('http://localhost:3000/api/posts' + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }), maxPosts: postData.maxPosts
        };
      }))
      .subscribe((transformedPostsData) => {

        this.posts = transformedPostsData.posts;
        // Update post updated observer
        this.postUpdatedObserver.next({ posts: [...this.posts], postCount: transformedPostsData.maxPosts });
      });
    // return [...this.posts];
  }

  postUpdatedObserverListener() {
    return this.postUpdatedObserver.asObservable();
  }

  /** Adding a new Post to original post array */
  addPost(tlt: string, cont: string, image: File): void {
    // const post: Post = {id: null, title: tlt, content: cont};

    const postFormdata = new FormData();
    postFormdata.append('title', tlt);
    postFormdata.append('content', cont);
    postFormdata.append('image', image); // postFormdata.append('image', image, image);


    this.httpClient.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postFormdata)
      .subscribe((responseData) => {
        // const post: Post = {id: responseData.post.postId,
        //   title: responseData.post.title, content: responseData.post.content,
        //   imagePath: responseData.post.imagePath};

        // // const postId = responseData.postId;
        // // post.id = postId;
        // this.posts.push(post);
        // // Pass updated posts list to this subject observer
        // // This emits the obserber with nwe post
        // this.postUpdatedObserver.next([...this.posts]);

        // Naviagte to PostList Component
        this.router.navigate(['/']);
      });
  }

  // Delete Post
  deletePost(postId: string): any {

    return this.httpClient.delete(`http://localhost:3000/api/posts/${postId}`);
  }

  // Get Single POst
  getPost(id: string): any {
    return this.httpClient.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>(`http://localhost:3000/api/posts/${id}`);
  }

  // Update Post
  updatePost(id: string, title: string, content: string, image: File | string) {

    let postData: Post | FormData;
    console.log(typeof (image));
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { id: id, title: title, content: content, image: image, creator: null };
    }
    // Sending put request to Node server..

    this.httpClient.put(`http://localhost:3000/api/posts/${id}`, postData).subscribe((response) => {
      // console.log(response);

      // // Update the post in angular app..
      // const currentPosts = [...this.posts];
      // const oldPostIndex = currentPosts.findIndex( (curpost) => curpost.id === id);
      // const post: Post = {
      //     id: id,
      //     title: title,
      //     content: content,
      //     imagePath: response.imagePath
      // };
      // currentPosts[oldPostIndex] = post;
      // this.posts = currentPosts;
      // // emit subject event to update new data everywhere
      // this.postUpdatedObserver.next([...this.posts]);

      // Naviagte to PostList Component
      this.router.navigate(['/']);
    });


  }
}
