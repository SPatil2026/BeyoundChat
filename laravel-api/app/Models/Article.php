<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'url',
        'published_at',
        'is_updated',
        'references'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_updated' => 'boolean',
        'references' => 'array'
    ];
}