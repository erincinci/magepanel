//
//  OKBreakpoint.h
//  OkudaKit
//
//  Created by Todd Ditchendorf on 7/14/13.
//
//

#import <Foundation/Foundation.h>

@interface OKBreakpoint : NSObject <NSCopying>

+ (OKBreakpoint *)breakpointWithType:(NSUInteger)type file:(NSString *)path name:(NSString *)name lineNumber:(NSUInteger)lineNum enabled:(BOOL)enabled;

- (id)initWithType:(NSUInteger)type file:(NSString *)path name:(NSString *)name lineNumber:(NSUInteger)lineNum enabled:(BOOL)enabled;

+ (instancetype)fromPlist:(NSDictionary *)plist;
- (instancetype)initFromPlist:(NSDictionary *)plist;
- (NSDictionary *)asPlist;

- (NSString *)displayString;

@property (nonatomic, assign) NSUInteger type;
@property (nonatomic, copy) NSString *file;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSUInteger lineNumber;
@property (nonatomic, assign) BOOL enabled;
@end
