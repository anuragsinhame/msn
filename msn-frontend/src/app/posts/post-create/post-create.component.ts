import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';

// Custom Imports
import { PostsService } from '../posts.service';
import {MimeType} from './mime-type.validator';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit{
    post: Post;
    isLoading = false;
    form: FormGroup;    // Working with Reactive Forms
    imagePreview: string;
    private mode = 'create';
    private postId: string;

    constructor(public postsService: PostsService, public route: ActivatedRoute) {}

    ngOnInit(): void{
        // Creating/Declaring the reactive form
        this.form = new FormGroup({
            title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
            content: new FormControl(null, {validators: [Validators.required]}),
            image: new FormControl(null, {
                validators: [Validators.required],
                asyncValidators: [MimeType]
            })
        });

        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has('postId')){
               this.mode = 'edit';
               this.postId = paramMap.get('postId');
               this.isLoading = true;
               this.postsService.getPostById(this.postId).subscribe(postData => {
                   this.isLoading = false;
                //    this.isLoading = true;    // for test
                   this.post = {
                       id: postData._id,
                       title: postData.title,
                       content: postData.content,
                       imagePath: postData.imagePath,
                       creator: postData.creator
                    };
                   this.form.setValue({
                       title: this.post.title,
                       content: this.post.content,
                       image: this.post.imagePath
                   });
               });
            }else{
                this.mode = 'create';
                this.postId = null;
            }
        });
    }

    onImagePicked(event: Event): void{
        // as is used to type cast
        const file = (event.target as HTMLInputElement).files[0];
        this.form.patchValue({image: file});
        // updating the changed value and validating that
        this.form.get('image').updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    onAddPost(): void{
        if (this.form.invalid){
            return;
        }
        this.isLoading = true;
        if (this.mode === 'create'){
            this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
        } else {
            this.postsService.updatePost(
                this.postId,
                this.form.value.title,
                this.form.value.content,
                this.form.value.image
            );
        }
        this.form.reset();
    }
}
