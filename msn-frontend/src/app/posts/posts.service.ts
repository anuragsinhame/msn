import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// rxjs imports
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({ providedIn: 'root' })   // will ensure that only one instance is created
export class PostsService {
  private posts: Post[] = [];
  private updatedPosts = new Subject<{ posts: Post[], postCount: number }>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts(postsPerPage: number, currentPage: number): void {
    // return [...this.posts]; // JS nextgen feature - spread operator
    // return this.posts; // Old way

    // `` => backticks, special JS features, used to dynamically add value in normal string
    const queryParams = `?pageSize=${postsPerPage}&currentPage=${currentPage}`;

    // here unsubscription is handled by Angular
    this.http.get<{ message: string, posts: any, maxPosts: number }>(BACKEND_URL + queryParams)

      // map(postsData => {
      //     return postsData.posts.map(post => {
      //         return {
      //             title: post.title,
      //             content: post.content,
      //             id: post._id,
      //             imagePath: post.imagePath
      //         };
      //     });
      // }))

      .pipe(
        map(postsData => {
          return {
            posts: postsData.posts.map(post => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator
              };
            }),
            maxPosts: postsData.maxPosts
          };
        })
      )
      .subscribe((transformedPostsData) => {
        // console.log(transformedPostsData);
        this.posts = transformedPostsData.posts;
        this.updatedPosts.next({
          posts: [...this.posts],
          postCount: transformedPostsData.maxPosts
        });
        // console.log('Max', transformedPostsData.maxPosts);
      });
  }

  getPostById(postId: string): Observable<any> {
    return this.http.get<Post>(BACKEND_URL + postId);
  }

  getUpdatedPostsListener(): Observable<{ posts: Post[], postCount: number }> {
    return this.updatedPosts.asObservable();
  }

  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{ message: string, post: Post }>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        // Commented during pagination
        // removed below data, as the below data will be fetched when we navigate
        // Navigate will cause the execution of ngOnInit and will fetch the latest version
        // const post: Post = {
        //     id: responseData.post.id,
        //     title,
        //     content,
        //     imagePath: responseData.post.imagePath
        // };
        // console.log(responseData.message);
        // // making sure that the data is update only if we get succesful response from Node
        // this.posts.push(post);
        // this.updatedPosts.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string): void {
    let postData: Post | FormData;
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { id, title, content, imagePath: image, creator: null };
    }
    this.http.put(BACKEND_URL + id, postData).
      subscribe(response => {
        // Commented during pagination
        // removed below data, as the below data will be fetched when we navigate
        // Navigate will cause the execution of ngOnInit and will fetch the latest version
        // // Updating edited post locally START
        // const updatedEditedPosts = [...this.posts];
        // // finding the index of the current post
        // const oldPostIndex = updatedEditedPosts.findIndex(p => p.id === id);
        // // overwriting the old post
        // const post: Post = {
        //     id,
        //     title,
        //     content,
        //     imagePath: ''
        // };
        // updatedEditedPosts[oldPostIndex] = post;
        // // updating the local posts array
        // this.posts = updatedEditedPosts;
        // // letting all the components know that the posts are updated
        // this.updatedPosts.next([...this.posts]);
        // // Updating edited post locally END
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string): Observable<any> {
    return this.http.delete(BACKEND_URL + postId);
    // Commented during pagination
    // We will subscribe to the Observable in the post list component.
    // Now we will return the observable instead of subscribing
    // this.http.delete('http://localhost:3000/api/posts/' + postId);
    // .subscribe(() => {
    //     console.log('Deleted!');
    //     const updatedDeletedPost = this.posts.filter(post => post.id !== postId);
    //     this.posts = updatedDeletedPost;
    //     this.updatedPosts.next([...this.posts]);
    // });
  }
}
