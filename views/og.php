<?

if ($video = $controller->getVideo()) {
	$title .= ($title?' ':'').$video['title'];
	$site_image = $video['preview_url'];
}

?>
<meta property="og:type" content="website" />
<meta property="og:site_name" content="<?=$site_name?>" />
<meta property="og:url" content="<?=$controller->baseURL();?>" />
<meta property="og:image" content="<?=$site_image?>"/>
<meta property="og:title" content="<?=$title?>"/>

<link rel="image_src" href="<?=$site_image?>" />
<meta name="page-image" content="<?=$site_image?>"/>
<meta name="url" content="<?=$controller->baseURL();?>"/>