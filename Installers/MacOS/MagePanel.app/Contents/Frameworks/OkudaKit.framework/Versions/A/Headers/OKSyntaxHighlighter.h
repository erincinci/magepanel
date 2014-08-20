//
//  PKSyntaxHighlighter.h
//  HTTPClient
//
//  Created by Todd Ditchendorf on 12/26/08.
//  Copyright 2009 Todd Ditchendorf. All rights reserved.
//

#import <Foundation/Foundation.h>

@class OKSyntaxHighlighter;

@protocol OKSyntaxHighlighterAttributesProvider <NSObject>
- (NSMutableDictionary *)syntaxHighlighter:(OKSyntaxHighlighter *)highlighter attributesForGrammarNamed:(NSString *)grammarName;
@end

@interface OKSyntaxHighlighter : NSObject

+ (id)syntaxHighlighter;

- (NSMutableAttributedString *)highlightedStringForString:(NSString *)s ofGrammar:(NSString *)grammarName;

@property (nonatomic, assign) BOOL cacheParsers; // default is NO
@property (nonatomic, assign) BOOL foundTripleQuote;

@property (nonatomic, assign) id <OKSyntaxHighlighterAttributesProvider>attributesProvider; // weak ref
@end
